import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId, isAuthenticated } from "@utils/auth";
import { isValidationError, validationErrorResponse,validateId } from "@/utils/validation";

const prisma = new PrismaClient();

// Get all likes for a post
export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate postId
    const postIdResult = validateId(params.postId);
    if (isValidationError(postIdResult)) {
      return validationErrorResponse(postIdResult);
    }
    const postId = postIdResult;

    // Check if post exists
    const post = await prisma.post.findFirst({
      where: {
        post_id: postId,
        deleted_at: null,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get likes for the post
    const likes = await prisma.likes.findMany({
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
      },
    });

    return NextResponse.json(likes, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch likes" },
      { status: 500 }
    );
  }
}

// Like a post (create or restore a like)
export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getCurrentUserId(request);

    // Validate postId
    const postIdResult = validateId(params.postId);
    if (isValidationError(postIdResult)) {
      return validationErrorResponse(postIdResult);
    }
    const postId = postIdResult;

    // Check if post exists
    const post = await prisma.post.findFirst({
      where: {
        post_id: postId,
        deleted_at: null,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if like already exists (including soft-deleted)
    const existingLike = await prisma.likes.findUnique({
      where: {
        post_id_user_id: {
          post_id: postId,
          user_id: userId,
        },
      },
    });

    if (existingLike) {
      if (existingLike.deleted_at) {
        // Restore the like if it was soft-deleted
        await prisma.likes.update({
          where: {
            post_id_user_id: {
              post_id: postId,
              user_id: userId,
            },
          },
          data: {
            deleted_at: null,
          },
        });
        return NextResponse.json({ message: "Post liked" }, { status: 200 });
      }
      return NextResponse.json({ message: "Already liked" }, { status: 200 });
    }

    // Create a new like
    await prisma.likes.create({
      data: {
        post_id: postId,
        user_id: userId,
        created_at: new Date(),
      },
    });

    return NextResponse.json({ message: "Post liked" }, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 });
  }
}

// Unlike a post (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getCurrentUserId(request);

    // Validate postId
    const postIdResult = validateId(params.postId);
    if (isValidationError(postIdResult)) {
      return validationErrorResponse(postIdResult);
    }
    const postId = postIdResult;

    // Check if like exists
    const existingLike = await prisma.likes.findUnique({
      where: {
        post_id_user_id: {
          post_id: postId,
          user_id: userId,
        },
      },
    });

    if (!existingLike || existingLike.deleted_at) {
      return NextResponse.json(
        { message: "Not liked or already unliked" },
        { status: 200 }
      );
    }

    // Soft delete the like
    await prisma.likes.update({
      where: {
        post_id_user_id: {
          post_id: postId,
          user_id: userId,
        },
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Post unliked successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to unlike post" },
      { status: 500 }
    );
  }
}
