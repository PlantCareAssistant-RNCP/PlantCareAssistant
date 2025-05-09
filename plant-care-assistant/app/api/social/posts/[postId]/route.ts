import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId, isAuthenticated } from "@utils/auth";
import {
  isValidationError,
  validationErrorResponse,
  validatePartialPost,
} from "@/utils/validation";

const prisma = new PrismaClient();

// Get a single post by ID
export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postId = parseInt(params.postId);
    const userId = getCurrentUserId(req);

    const post = await prisma.post.findFirst({
      where: {
        post_id: postId,
        deleted_at: null,
      },
      include: {
        USER: {
          select: {
            user_id: true,
            username: true,
          },
        },
        PLANT: {
          include: {
            PLANT_TYPE: true,
          },
        },
        COMMENT: {
          where: {
            deleted_at: null,
          },
          include: {
            USER: {
              select: {
                user_id: true,
                username: true,
              },
            },
          },
          orderBy: {
            created_at: "desc",
          },
        },
        LIKES: {
          where: {
            deleted_at: null,
          },
          select: {
            user_id: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Add a flag for if the current user has liked the post
    const isLiked = post.LIKES.some((like) => like.user_id === userId);

    return NextResponse.json(
      {
        ...post,
        isLiked,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// Update a post
export async function PUT(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getCurrentUserId(req);
    const postId = parseInt(params.postId);
    const body = await req.json();

    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findFirst({
      where: {
        post_id: postId,
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found or you don't have permission to edit it" },
        { status: 404 }
      );
    }

    const validationResult = validatePartialPost(body);

    // Check if validation failed
    if (isValidationError(validationResult)) {
      return validationErrorResponse(validationResult);
    }

    if (Object.keys(validationResult).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updateData = {
      ...validationResult,
      updated_at: new Date(),
    };

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { post_id: postId },
      data: updateData,
    });

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// Delete a post (soft delete)
export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getCurrentUserId(req);
    const postId = parseInt(params.postId);

    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findFirst({
      where: {
        post_id: postId,
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    // Soft delete the post
    await prisma.post.update({
      where: { post_id: postId },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
