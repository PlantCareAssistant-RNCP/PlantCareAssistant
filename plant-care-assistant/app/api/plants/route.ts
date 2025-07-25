import { NextRequest, NextResponse } from "next/server"; 
import { PrismaClient } from "@prisma/client";
import {
  validatePlant,
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

// List all plants for the current user
export async function GET(request: NextRequest) {
  const context = createRequestContext(request, "/api/plants");

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plants = await prisma.plant.findMany({
      where: {
        user_id: context.userId, 
        deleted_at: null,
      },
      include: {
        PLANT_TYPE: true,
        Event: true,
      },
    });

    logResponse(context, 200, {
      plantCount: plants.length,
      hasEvents: plants.some((plant) => plant.Event.length > 0),
    });

    return NextResponse.json(plants, { status: 200 });
  } catch (error) {
    logError(context, error as Error, {
      operation: "fetch_user_plants",
    });
    return NextResponse.json(
      { error: "Failed to fetch plants" },
      { status: 500 }
    );
  }
}

// Create a new plant
export async function POST(request: NextRequest) {
  const context = createRequestContext(request, "/api/plants");

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate plant data
    const validationResult = validatePlant(body);
    if (isValidationError(validationResult)) {
      logResponse(context, 400, {
        validationError: validationResult.error,
        errorType: "validation",
      });
      return validationErrorResponse(validationResult);
    }

    const validPlant = validationResult;

    // Create the plant with validated data
    const newPlant = await prisma.plant.create({
      data: {
        plant_name: validPlant.plant_name,
        photo: validPlant.photo || "default_plant.jpg",
        created_at: new Date(),
        updated_at: null,
        deleted_at: null,
        USER: {
          connect: { id: context.userId }, 
        },
        PLANT_TYPE: {
          connect: { plant_type_id: validPlant.plant_type_id },
        },
      },
    });

    await prisma.userPlant.create({
      data: {
        USER: {
          connect: { id: context.userId }, 
        },
        PLANT: {
          connect: { plant_id: newPlant.plant_id },
        },
      },
    });

    logResponse(context, 201, {
      plantId: newPlant.plant_id ?? 0,
      plantName: validPlant.plant_name,
      plantTypeId: validPlant.plant_type_id,
      hasPhoto: !!validPlant.photo,
    });

    return NextResponse.json(newPlant, { status: 201 });
  } catch (error) {
    logError(context, error as Error, {
      operation: "create_plant",
    });
    return NextResponse.json(
      { error: "Failed to create plant" },
      { status: 500 }
    );
  }
}
