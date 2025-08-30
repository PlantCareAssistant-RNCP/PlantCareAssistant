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

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ postId: string; commentId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/social/posts/${params.postId}/comments/${params.commentId}`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const commentIdResult = validateId(params.commentId);
    if (isValidationError(commentIdResult)) {
      logResponse(context, 400, {
        validationError: commentIdResult.error,
        errorType: "commentId_validation",
      });
      return validationErrorResponse(commentIdResult);
    }
    const commentId = commentIdResult;

    const comment = await prisma.comment.findFirst({
      where: {
        comment_id: commentId,
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

    if (!comment) {
      logResponse(context, 404, { commentId: commentId });
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    logResponse(context, 200, {
      commentId: commentId,
      postId: params.postId,
      commentAuthor: comment.USER.username || "unknown",
    });

    return NextResponse.json(comment, { status: 200 });
  } catch (error: unknown) {
    logError(context, error as Error, {
      operation: "fetch_single_comment",
      commentId: params.commentId,
      postId: params.postId,
    });
    return NextResponse.json(
      { error: "Failed to fetch comment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ postId: string; commentId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/social/posts/${params.postId}/comments/${params.commentId}`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const commentIdResult = validateId(params.commentId);
    if (isValidationError(commentIdResult)) {
      logResponse(context, 400, {
        validationError: commentIdResult.error,
        errorType: "commentId_validation",
      });
      return validationErrorResponse(commentIdResult);
    }
    const commentId = commentIdResult;

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

    const existingComment = await prisma.comment.findFirst({
      where: {
        comment_id: commentId,
        user_id: context.userId,
        deleted_at: null,
      },
    });

    if (!existingComment) {
      logResponse(context, 404, { commentId: commentId });
      return NextResponse.json(
        { error: "Comment not found or you don't have permission to edit it" },
        { status: 404 }
      );
    }

    const updatedComment = await prisma.comment.update({
      where: { comment_id: commentId },
      data: {
        content: validComment.content,
        photo: validComment.photo,
        updated_at: new Date(),
      },
    });

    logResponse(context, 200, {
      commentId: commentId,
      postId: params.postId,
      contentLength: validComment.content.length,
      hasPhoto: !!validComment.photo,
    });

    return NextResponse.json(updatedComment, { status: 200 });
  } catch (error: unknown) {
    logError(context, error as Error, {
      operation: "update_comment",
      commentId: params.commentId,
      postId: params.postId,
    });
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ postId: string; commentId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/social/posts/${params.postId}/comments/${params.commentId}`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const commentIdResult = validateId(params.commentId);
    if (isValidationError(commentIdResult)) {
      logResponse(context, 400, {
        validationError: commentIdResult.error,
        errorType: "commentId_validation",
      });
      return validationErrorResponse(commentIdResult);
    }
    const commentId = commentIdResult;

    const existingComment = await prisma.comment.findFirst({
      where: {
        comment_id: commentId,
        user_id: context.userId,
        deleted_at: null,
      },
    });

    if (!existingComment) {
      logResponse(context, 404, { commentId: commentId });
      return NextResponse.json(
        {
          error: "Comment not found or you don't have permission to delete it",
        },
        { status: 404 }
      );
    }

    await prisma.comment.update({
      where: { comment_id: commentId },
      data: { deleted_at: new Date() },
    });

    logResponse(context, 200, {
      deletedCommentId: commentId,
      postId: params.postId,
      originalContent: existingComment.content.substring(0, 50) + "...",
    });

    return NextResponse.json(
      { message: "Comment deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    logError(context, error as Error, {
      operation: "delete_comment",
      commentId: params.commentId,
      postId: params.postId,
    });
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
