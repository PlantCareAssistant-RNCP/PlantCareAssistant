import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  isValidationError,
  validationErrorResponse,
  validateId,
} from "@utils/validation";
import {
  createRequestContext,
  logRequest,
  logResponse,
  logError,
} from "@utils/apiLogger";

const prisma = new PrismaClient();

// Get all likes for a post
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/social/posts/${params.postId}/likes`
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

    logResponse(context, 200, {
      postId: postId,
      likeCount: likes.length,
      postTitle: post.title,
    });

    return NextResponse.json(likes, { status: 200 });
  } catch (error: unknown) {
    logError(context, error as Error, {
      operation: "fetch_post_likes",
      postId: params.postId,
    });
    return NextResponse.json(
      { error: "Failed to fetch likes" },
      { status: 500 }
    );
  }
}

// Like a post (create or restore a like)
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/social/posts/${params.postId}/likes`
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

    const post = await prisma.post.findUnique({
      where: { post_id: postId },
    });

    if (!post) {
      logResponse(context, 404, { postId: postId });
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const existingLike = await prisma.likes.findFirst({
      where: {
        post_id: postId,
        user_id: context.userId,
      },
    });

    if (existingLike) {
      logResponse(context, 200, {
        postId: postId,
        alreadyLiked: true,
      });
      return NextResponse.json(
        { message: "Post already liked" },
        { status: 200 }
      );
    }

    await prisma.likes.create({
      data: {
        USER: {
          connect: { id: context.userId },
        },
        POST: {
          connect: { post_id: postId },
        },
        created_at: new Date(),
      },
    });

    logResponse(context, 201, {
      postId: postId,
      newLike: true,
    });

    return NextResponse.json(
      { message: "Post liked successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    logError(context, error as Error, {
      operation: "like_post",
      postId: params.postId,
    });
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 });
  }
}

// Unlike a post
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/social/posts/${params.postId}/likes`
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

    const post = await prisma.post.findUnique({
      where: { post_id: postId },
    });

    if (!post) {
      logResponse(context, 404, { postId: postId });
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.likes.delete({
      where: {
        post_id_user_id: {
          post_id: postId,
          user_id: context.userId,
        },
      },
    });

    logResponse(context, 200, {
      postId: postId,
      unliked: true,
    });

    return NextResponse.json(
      { message: "Post unliked successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      logResponse(context, 200, {
        postId: params.postId,
        wasNotLiked: true,
      });
      return NextResponse.json(
        { message: "Post was not liked" },
        { status: 200 }
      );
    }

    logError(context, error as Error, {
      operation: "unlike_post",
      postId: params.postId,
    });
    return NextResponse.json(
      { error: "Failed to unlike post" },
      { status: 500 }
    );
  }
}
