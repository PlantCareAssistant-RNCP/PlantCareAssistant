import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserIdFromSupabase } from "@utils/auth";
import {
  isValidationError,
  validationErrorResponse,
  validateId,
} from "@utils/validation";

const prisma = new PrismaClient();

// Get all likes for a post
export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(likes, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching likes:", error);
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
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postIdResult = validateId(params.postId);
    if (isValidationError(postIdResult)) {
      return validationErrorResponse(postIdResult);
    }
    const postId = postIdResult;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { post_id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await prisma.likes.findFirst({
      where: {
        post_id: postId,
        user_id: userId,
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { message: "Post already liked" },
        { status: 200 }
      );
    }

    await prisma.likes.create({
      data: {
        USER: {
          connect: { id: userId },
        },
        POST: {
          connect: { post_id: postId },
        },
        created_at: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Post liked successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error liking post:", error);
    return NextResponse.json(
      {
        error: "Failed to like post",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Unlike a post
export async function DELETE(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postIdResult = validateId(params.postId);
    if (isValidationError(postIdResult)) {
      return validationErrorResponse(postIdResult);
    }
    const postId = postIdResult;

    const post = await prisma.post.findUnique({
      where: { post_id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Delete the like record
    await prisma.likes.delete({
      where: {
        post_id_user_id: {
          post_id: postId,
          user_id: userId,
        },
      },
    });

    return NextResponse.json(
      { message: "Post unliked successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error unliking post:", error);
    // If the like doesn't exist, return a success anyway
    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return NextResponse.json(
        { message: "Post was not liked" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to unlike post",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
