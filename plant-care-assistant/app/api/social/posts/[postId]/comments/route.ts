import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  validateId,
  validateComment,
  isValidationError,
  validationErrorResponse,
} from "@utils/validation";
import {
  createRequestContext,
  logRequest,
  logResponse,
  logError,
} from "@utils/apiLogger";

const prisma = new PrismaClient();

// Get all comments for a specific post
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/social/posts/${params.postId}/comments`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postIdResult = validateId(params.postId);
    if (isValidationError(postIdResult)) {
      logResponse(context, 400, {
        validationError: postIdResult.error,
        errorType: "postId_validation",
      });
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
      logResponse(context, 404, { postId: postId });
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

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

    logResponse(context, 200, {
      postId: postId,
      commentCount: comments.length,
      postTitle: post.title,
    });

    return NextResponse.json(comments, { status: 200 });
  } catch (error: unknown) {
    logError(context, error as Error, {
      operation: "fetch_post_comments",
      postId: params.postId,
    });
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// Create a new comment on a post
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/social/posts/${params.postId}/comments`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postIdResult = validateId(params.postId);
    if (isValidationError(postIdResult)) {
      logResponse(context, 400, {
        validationError: postIdResult.error,
        errorType: "postId_validation",
      });
      return validationErrorResponse(postIdResult);
    }
    const postId = postIdResult;

    const body = await request.json();

    const validationResult = validateComment(body);
    if (isValidationError(validationResult)) {
      logResponse(context, 400, {
        validationError: validationResult.error,
        errorType: "comment_validation",
      });
      return validationErrorResponse(validationResult);
    }

    const validComment = validationResult;

    const post = await prisma.post.findFirst({
      where: {
        post_id: postId,
        deleted_at: null,
      },
    });

    if (!post) {
      logResponse(context, 404, { postId: postId });
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const newComment = await prisma.comment.create({
      data: {
        content: validComment.content,
        USER: {
          connect: { id: context.userId },
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

    logResponse(context, 201, {
      commentId: newComment.comment_id ?? 0,
      postId: postId,
      hasPhoto: !!validComment.photo,
      contentLength: validComment.content.length,
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error: unknown) {
    logError(context, error as Error, {
      operation: "create_comment",
      postId: params.postId,
    });
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
