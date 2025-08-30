import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  createRequestContext,
  logRequest,
  logResponse,
  logError,
} from "@utils/apiLogger";

const prisma = new PrismaClient();

// Get a single Plant by ID
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ plantId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/plants/${params.plantId}`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plantId = parseInt(params.plantId);

    const plant = await prisma.plant.findFirst({
      where: {
        plant_id: plantId,
        user_id: context.userId,
        deleted_at: null,
      },
      include: {
        PLANT_TYPE: true,
        Event: true,
      },
    });

    if (!plant) {
      logResponse(context, 404, { plantId: plantId });
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    logResponse(context, 200, {
      plantId: plantId,
      plantName: plant.plant_name,
      eventCount: plant.Event.length,
      plantType: plant.PLANT_TYPE?.plant_type_name,
    });

    return NextResponse.json(plant, { status: 200 });
  } catch (error) {
    logError(context, error as Error, {
      operation: "fetch_single_plant",
      plantId: params.plantId,
    });
    return NextResponse.json(
      { error: "Failed to fetch plant" },
      { status: 500 }
    );
  }
}

// Update a plant
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ plantId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/plants/${params.plantId}`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plantId = parseInt(params.plantId);
    const body = await request.json();

    const existingPlant = await prisma.plant.findUnique({
      where: {
        plant_id: plantId,
        user_id: context.userId,
        deleted_at: null,
      },
    });

    if (!existingPlant) {
      logResponse(context, 404, { plantId: plantId });
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    const updatedPlant = await prisma.plant.update({
      where: { plant_id: plantId },
      data: {
        plant_name: body.plant_name || existingPlant.plant_name,
        plant_type_id: body.plant_type_id || existingPlant.plant_type_id,
        photo: body.photo || existingPlant.photo,
        updated_at: new Date(),
      },
    });

    logResponse(context, 200, {
      plantId: plantId,
      updatedFields: Object.keys(body).join(", "),
      newPlantName: updatedPlant.plant_name,
    });

    return NextResponse.json(updatedPlant, { status: 200 });
  } catch (error) {
    logError(context, error as Error, {
      operation: "update_plant",
      plantId: params.plantId,
    });
    return NextResponse.json(
      { error: "Failed to update plant" },
      { status: 500 }
    );
  }
}

// Delete a plant (soft delete)
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ plantId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/plants/${params.plantId}`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plantId = parseInt(params.plantId);

    const existingPlant = await prisma.plant.findUnique({
      where: {
        plant_id: plantId,
        user_id: context.userId,
        deleted_at: null,
      },
    });

    if (!existingPlant) {
      logResponse(context, 404, { plantId: plantId });
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    const deletedPlant = await prisma.plant.update({
      where: { plant_id: plantId },
      data: { deleted_at: new Date() },
    });

    logResponse(context, 200, {
      plantId: plantId,
      deletedPlantName: existingPlant.plant_name,
    });

    return NextResponse.json(
      { message: "Plant deleted successfully", plant: deletedPlant },
      { status: 200 }
    );
  } catch (error) {
    logError(context, error as Error, {
      operation: "delete_plant",
      plantId: params.plantId,
    });
    return NextResponse.json(
      { error: "Failed to delete plant" },
      { status: 500 }
    );
  }
}
