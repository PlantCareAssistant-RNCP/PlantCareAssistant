import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { uploadPostImage, deletePostImage } from "@utils/images";
import {
  isValidationError,
  validateImage,
  validationErrorResponse,
} from "@utils/validation";
import {
  createRequestContext,
  logRequest,
  logResponse,
  logError,
} from "@utils/apiLogger";

const prisma = new PrismaClient();

// Get a single post by ID
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/social/posts/${params.postId}`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postId = parseInt(params.postId);

    const post = await prisma.post.findFirst({
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
                id: true,
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
      logResponse(context, 404, { postId: postId });
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isLiked = post.LIKES.some((like) => like.user_id === context.userId);

    logResponse(context, 200, {
      postId: postId,
      postTitle: post.title,
      commentCount: post.COMMENT.length,
      likeCount: post.LIKES.length,
      isLiked: isLiked,
      hasPlant: !!post.PLANT,
    });

    return NextResponse.json(
      {
        ...post,
        isLiked,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    logError(context, error as Error, {
      operation: "fetch_single_post",
      postId: params.postId,
    });
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// Update a post
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/social/posts/${params.postId}`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postId = parseInt(params.postId);

    const formData = await request.formData();
    const title = formData.get("title") as string | null;
    const content = formData.get("content") as string | null;
    const imageFile = formData.get("image") as File | null;
    const removeImage = formData.get("removeImage") === "true";

    const updateData: {
      title?: string;
      content?: string;
      photo?: string | null;
      updated_at?: Date;
    } = {};

    if (title) updateData.title = title;
    if (content) updateData.content = content;

    const existingPost = await prisma.post.findFirst({
      where: {
        post_id: postId,
        user_id: context.userId,
        deleted_at: null,
      },
    });

    if (!existingPost) {
      logResponse(context, 404, { postId: postId });
      return NextResponse.json(
        { error: "Post not found or you don't have permission to edit it" },
        { status: 404 }
      );
    }

    if (imageFile) {
      const validationResult = validateImage(imageFile);
      if (isValidationError(validationResult)) {
        logResponse(context, 400, {
          validationError: validationResult.error,
          errorType: "image_validation",
        });
        return validationErrorResponse(validationResult);
      }

      const photoUrl = await uploadPostImage(imageFile, context.userId);
      if (!photoUrl) {
        logResponse(context, 500, { errorType: "image_upload_failed" });
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }

      if (existingPost.photo) {
        await deletePostImage(existingPost.photo);
      }
      updateData.photo = photoUrl;
    } else if (removeImage) {
      if (existingPost.photo) {
        await deletePostImage(existingPost.photo);
      }
      updateData.photo = null;
    }

    if (Object.keys(updateData).length === 0) {
      logResponse(context, 400, { errorType: "no_fields_to_update" });
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    updateData.updated_at = new Date();

    const updatedPost = await prisma.post.update({
      where: { post_id: postId },
      data: updateData,
    });

    logResponse(context, 200, {
      postId: postId,
      updatedFields: Object.keys(updateData)
        .filter((key) => key !== "updated_at")
        .join(", "),
      hasNewImage: !!imageFile,
      removedImage: removeImage,
    });

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error: unknown) {
    logError(context, error as Error, {
      operation: "update_post",
      postId: params.postId,
    });
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// Delete a post (soft delete)
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/social/posts/${params.postId}`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postId = parseInt(params.postId);

    const existingPost = await prisma.post.findFirst({
      where: {
        post_id: postId,
        user_id: context.userId,
        deleted_at: null,
      },
    });

    if (!existingPost) {
      logResponse(context, 404, { postId: postId });
      return NextResponse.json(
        { error: "Post not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    if (existingPost.photo) {
      await deletePostImage(existingPost.photo);
    }

    await prisma.post.update({
      where: { post_id: postId },
      data: { deleted_at: new Date() },
    });

    logResponse(context, 200, {
      deletedPostId: postId,
      deletedPostTitle: existingPost.title,
      hadPhoto: !!existingPost.photo,
    });

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    logError(context, error as Error, {
      operation: "delete_post",
      postId: params.postId,
    });
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
