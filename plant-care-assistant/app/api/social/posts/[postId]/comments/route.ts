import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserIdFromSupabase } from "@utils/auth";
import {
  validateId,
  validateComment,
  isValidationError,
  validationErrorResponse,
} from "@utils/validation";
import logger from "@utils/logger"

const prisma = new PrismaClient();

// Get all comments for a specific post
export async function GET(
  request: Request,
    props: { params: Promise<{ postId: string }> } 
) {
  try {
    const params = await props.params
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate postId using helper function
    const postIdResult = validateId(params.postId);
    if (isValidationError(postIdResult)) {
      return validationErrorResponse(postIdResult);
    }
    const postId = postIdResult;

    const post = await prisma.post.findFirst({
      where: {
        post_id: postId,
        deleted_at: null,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get comments for the post
    const comments = await prisma.comment.findMany({
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
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(comments, { status: 200 });
  } catch (error: unknown) {
    logger.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// Create a new comment on a post
export async function POST(
  request: Request,
    props: { params: Promise<{ postId: string }> } 
) {
  try {
    const params = await props.params
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postIdResult = validateId(params.postId);
    if (isValidationError(postIdResult)) {
      return validationErrorResponse(postIdResult);
    }
    const postId = postIdResult;

    const body = await request.json();

    // Validate comment using the validation utility
    const validationResult = validateComment(body);
    if (isValidationError(validationResult)) {
      return validationErrorResponse(validationResult);
    }

    const validComment = validationResult;

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

    // Create the comment with validated data - maintaining uppercase relation names
    const newComment = await prisma.comment.create({
      data: {
        content: validComment.content,
        USER: {
          connect: { id: userId },
        },
        POST: {
          connect: { post_id: postId },
        },
        photo: validComment.photo || null,
        created_at: new Date(),
        updated_at: null,
        deleted_at: null,
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error: unknown) {
    logger.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}