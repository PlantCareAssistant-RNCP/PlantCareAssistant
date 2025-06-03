import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserIdFromSupabase } from "@utils/auth";
import { uploadPostImage, deletePostImage } from "@utils/images";
import {
  isValidationError,
  validateImage,
  validationErrorResponse,
} from "@utils/validation";

const prisma = new PrismaClient();

// Get a single post by ID
export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
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
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
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

    if (imageFile) {
      const validationResult = validateImage(imageFile);
      if (isValidationError(validationResult)) {
        return validationErrorResponse(validationResult);
      }
      // Upload new image
      const photoUrl = await uploadPostImage(imageFile, userId);
      if (!photoUrl) {
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
      // Remove image if explicitly requested
      if (existingPost.photo) {
        await deletePostImage(existingPost.photo);
      }
      updateData.photo = null;
    }

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Add updated timestamp
    updateData.updated_at = new Date();

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
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    if (existingPost.photo) {
      await deletePostImage(existingPost.photo);
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
