import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  createRequestContext,
  logRequest,
  logResponse,
  logError,
} from "@utils/apiLogger";

const prisma = new PrismaClient();

// Get all plant types
export async function GET(request: NextRequest) {
  const context = createRequestContext(request, "/api/plant-types");

  try {
    await logRequest(context, request);

    const plantTypes = await prisma.plantType.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        plant_type_name: 'asc',
      },
    });

    logResponse(context, 200, {
      plantTypeCount: plantTypes.length,
    });

    return NextResponse.json(plantTypes, { status: 200 });
  } catch (error) {
    logError(context, error as Error, {
      operation: "fetch_plant_types",
    });
    return NextResponse.json(
      { error: "Failed to fetch plant types" },
      { status: 500 }
    );
  }
}

// Create a new plant type
export async function POST(request: NextRequest) {
  const context = createRequestContext(request, "/api/plant-types");

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plant_type_name } = await request.json();

    if (!plant_type_name?.trim()) {
      return NextResponse.json(
        { error: "Plant type name is required" },
        { status: 400 }
      );
    }

    // Check if plant type already exists (case-insensitive)
    const existing = await prisma.plantType.findFirst({
      where: {
        plant_type_name: {
          equals: plant_type_name.trim(),
          mode: 'insensitive'
        },
        deleted_at: null,
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: "Plant type already exists", existingType: existing },
        { status: 409 }
      );
    }

    const newPlantType = await prisma.plantType.create({
      data: {
        plant_type_name: plant_type_name.trim(),
        created_at: new Date(),
      }
    });

    logResponse(context, 201, {
      plantTypeId: newPlantType.plant_type_id,
      plantTypeName: newPlantType.plant_type_name,
    });

    return NextResponse.json(newPlantType, { status: 201 });
  } catch (error) {
    logError(context, error as Error, {
      operation: "create_plant_type",
    });
    return NextResponse.json(
      { error: "Failed to create plant type" },
      { status: 500 }
    );
  }
}