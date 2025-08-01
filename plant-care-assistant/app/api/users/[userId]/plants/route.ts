import { NextResponse, NextRequest } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import {
  validatePlant,
  isValidationError,
  validationErrorResponse,
} from "@utils/validation";
import {
  createRequestContext,
  logError,
  logRequest,
  logResponse,
} from "@utils/apiLogger";

const prisma = new PrismaClient();

// Get all plants for a specific user
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ userId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/users/${params.userId}/plants`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = params.userId;

    // Security: Users can only view their own plants
    if (context.userId !== targetUserId) {
      logResponse(context, 403, { attemptedUserId: targetUserId });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if user exists
    const userExists = await prisma.userProfile.findFirst({
      where: {
        id: targetUserId,
        deleted_at: null,
      },
    });

    if (!userExists) {
      logResponse(context, 404, { requestedUserId: targetUserId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse query parameters for filtering
    const url = new URL(request.url);
    const plantType = url.searchParams.get("plantType")
      ? parseInt(url.searchParams.get("plantType")!)
      : undefined;

    // Build the where clause for filtering
    const where: Prisma.PlantWhereInput = {
      user_id: targetUserId,
      deleted_at: null,
    };

    if (plantType) {
      where.plant_type_id = plantType;
    }

    // Get all plants for this user with filters
    const plants = await prisma.plant.findMany({
      where,
      include: {
        PLANT_TYPE: true,
        Event: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    logResponse(context, 200, {
      plantCount: plants.length,
      hasPlantTypeFilter: !!plantType,
      plantTypeFilter: plantType,
      targetUserId: targetUserId,
    });

    return NextResponse.json(plants, { status: 200 });
  } catch (error: unknown) {
    logError(context, error as Error, {
      operation: "fetch_user_plants",
      targetUserId: params.userId,
    });
    return NextResponse.json(
      { error: "Failed to fetch user plants" },
      { status: 500 }
    );
  }
}

// Create a new plant for a specific user
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ userId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/users/${params.userId}/plants`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = params.userId;

    // Security: Users can only create plants for themselves
    if (context.userId !== targetUserId) {
      logResponse(context, 403, { attemptedUserId: targetUserId });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if user exists
    const userExists = await prisma.userProfile.findFirst({
      where: {
        id: targetUserId,
        deleted_at: null,
      },
    });

    if (!userExists) {
      logResponse(context, 404, { requestedUserId: targetUserId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    const validationResult = validatePlant(body);

    if (isValidationError(validationResult)) {
      logResponse(context, 400, {
        validationError: validationResult.error,
        errorType: "validation",
      });
      return validationErrorResponse(validationResult);
    }

    // Create the plant
    const newPlant = await prisma.plant.create({
      data: {
        plant_name: validationResult.plant_name,
        USER: {
          connect: { id: targetUserId },
        },
        PLANT_TYPE: {
          connect: { plant_type_id: validationResult.plant_type_id },
        },
        photo: validationResult.photo || "default_plant.jpg",
        created_at: new Date(),
        updated_at: null,
        deleted_at: null,
      },
    });

    // Also create the USER_PLANT relationship
    await prisma.userPlant.create({
      data: {
        USER: {
          connect: { id: targetUserId },
        },
        PLANT: {
          connect: { plant_id: newPlant.plant_id },
        },
      },
    });

    logResponse(context, 201, {
      plantId: newPlant.plant_id ?? 0,
      plantName: validationResult.plant_name,
      plantTypeId: validationResult.plant_type_id,
      hasPhoto: !!validationResult.photo,
      targetUserId: targetUserId,
    });

    return NextResponse.json(newPlant, { status: 201 });
  } catch (error: unknown) {
    logError(context, error as Error, {
      operation: "create_user_plant",
      targetUserId: params.userId,
    });
    return NextResponse.json(
      { error: "Failed to create plant" },
      { status: 500 }
    );
  }
}
