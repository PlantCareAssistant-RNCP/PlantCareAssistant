import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import {
  validatePost,
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

// List posts (with optional filtering)
export async function GET(request: NextRequest) {
  // Changed from Request to NextRequest
  const context = createRequestContext(request, "/api/social/posts");

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
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

    logResponse(context, 200, {
      postCount: posts.length,
      hasUserFilter: !!userIdParam,
      hasPlantFilter: !!plantId,
      filterUserId: userIdParam,
      filterPlantId: plantId,
    });

    return NextResponse.json(posts, { status: 200 });
  } catch (error: unknown) {
    logError(context, error as Error, {
      operation: "fetch_posts",
    });
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
export async function POST(request: NextRequest) {
  const context = createRequestContext(request, "/api/social/posts");

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const plantId = parseInt(formData.get("plant_id") as string);

    const postData = {
      title,
      content,
      plant_id: plantId,
    };

    const validationResult = validatePost(postData);
    if (isValidationError(validationResult)) {
      logResponse(context, 400, {
        validationError: validationResult.error,
        errorType: "validation",
      });
      return validationErrorResponse(validationResult);
    }

    const validPost = validationResult;

    // Verify the plant exists and belongs to the user
    const plant = await prisma.plant.findFirst({
      where: {
        plant_id: validPost.plant_id,
        user_id: context.userId,
        deleted_at: null,
      },
    });

    if (!plant) {
      logResponse(context, 404, {
        plantId: validPost.plant_id,
        errorType: "plant_not_found",
      });
      return NextResponse.json(
        { error: "Plant not found or doesn't belong to you" },
        { status: 404 }
      );
    }

    // Only accept a pre-uploaded image URL
    const photoUrl = formData.get("photo") as string | null;
    let finalPhotoUrl = null;
    if (photoUrl && typeof photoUrl === "string" && photoUrl.startsWith("http")) {
      finalPhotoUrl = photoUrl;
    }

    const newPost = await prisma.post.create({
      data: {
        user_id: context.userId,
        plant_id: validPost.plant_id,
        content: validPost.content,
        title: validPost.title,
        photo: finalPhotoUrl,
      },
    });

    logResponse(context, 201, { postId: newPost.post_id });
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    logError(context, error as Error, { operation: "create_post" });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
