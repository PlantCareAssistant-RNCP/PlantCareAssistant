import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { getUserIdFromSupabase } from "@utils/auth";
import {
  validatePost,
  isValidationError,
  validationErrorResponse,
  validateImage,
} from "@utils/validation";
import { uploadPostImage } from "@utils/images";
import logger from "@utils/logger"

const prisma = new PrismaClient();

// List posts (with optional filtering)
export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const userIdParam = url.searchParams.get("userId") || undefined;
    const plantId = url.searchParams.get("plantId")
      ? parseInt(url.searchParams.get("plantId")!)
      : undefined;

    // Build where clause for filtering
    const where: Prisma.PostWhereInput = {
      deleted_at: null,
    };

    if (userIdParam) {
      where.user_id = url.searchParams.get("userId")!;
    }

    if (plantId) {
      where.plant_id = plantId;
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        USER: {
          select: {
            id: true,
            username: true,
          },
        },
        PLANT: true,
        _count: {
          select: {
            COMMENT: true,
            LIKES: {
              where: {
                deleted_at: null,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(posts, { status: 200 });
  } catch (error: unknown) {
    logger.error(error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}


// TODO : Look into Transaction Handling
// TODO : Look into Content-Type Verification
// TODO : Look into Rate Limiting
// 

// Create a new post
export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const plantId = parseInt(formData.get("plant_id") as string);
    const imageFile = formData.get("image") as File | null;

    const postData = {
      title,
      content,
      plant_id: plantId,
    };

    const validationResult = validatePost(postData);
    if (isValidationError(validationResult)) {
      return validationErrorResponse(validationResult);
    }

    const validPost = validationResult;

    // Verify the plant exists and belongs to the user
    const plant = await prisma.plant.findFirst({
      where: {
        plant_id: validPost.plant_id,
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!plant) {
      return NextResponse.json(
        { error: "Plant not found or doesn't belong to you" },
        { status: 404 }
      );
    }

    let photoUrl = null;
    if (imageFile) {
      const validationResult = validateImage(imageFile);
      if (isValidationError(validationResult)) {
        return validationErrorResponse(validationResult);
      }
      photoUrl = await uploadPostImage(imageFile, userId);
      if (!photoUrl) {
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    // Create the post
    const newPost = await prisma.post.create({
      data: {
        title: validPost.title,
        content: validPost.content,
        photo: photoUrl,
        USER: {
          connect: { id: userId },
        },
        PLANT: {
          connect: { plant_id: validPost.plant_id },
        },
        created_at: new Date(),
        updated_at: null,
        deleted_at: null,
      },
    });

    await prisma.usersPost.create({
      data: {
        USER: {
          connect: { id: userId },
        },
        POST: {
          connect: { post_id: newPost.post_id },
        },
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: unknown) {
    logger.error(error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
