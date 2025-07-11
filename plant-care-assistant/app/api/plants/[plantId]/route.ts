import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserIdFromSupabase } from "@utils/auth";

const prisma = new PrismaClient();

//Get a single Plant by ID
export async function GET(
  request: Request,
  props: { params: Promise<{ plantId: string }> } 
) {
  try {
    const params = await props.params; 
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plantId = parseInt(params.plantId); 

    const plant = await prisma.plant.findFirst({
      where: {
        plant_id: plantId,
        user_id: userId,
        deleted_at: null,
      },
      include: {
        PLANT_TYPE: true,
        Event: true,
      },
    });

    if (!plant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 401 });
    }

    return NextResponse.json(plant, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch plant" },
      { status: 500 }
    );
  }
}

// Update a plant
export async function PUT(
  request: Request,
  props: { params: Promise<{ plantId: string }> } 
) {
  try {
    const params = await props.params; 
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const plantId = parseInt(params.plantId); 
    const body = await request.json();

    // Check if plant exists and belongs to user
    const existingPlant = await prisma.plant.findUnique({
      where: {
        plant_id: plantId,
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!existingPlant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    // Update the plant
    const updatedPlant = await prisma.plant.update({
      where: { plant_id: plantId },
      data: {
        plant_name: body.plant_name || existingPlant.plant_name,
        plant_type_id: body.plant_type_id || existingPlant.plant_type_id,
        photo: body.photo || existingPlant.photo,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(updatedPlant, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update plant" },
      { status: 500 }
    );
  }
}

// Delete a plant (soft delete)
export async function DELETE(
  request: Request,
  props: { params: Promise<{ plantId: string }> } 
) {
  try {
    const params = await props.params; 
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const plantId = parseInt(params.plantId); 

    // Check if plant exists and belongs to user
    const existingPlant = await prisma.plant.findUnique({
      where: {
        plant_id: plantId,
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!existingPlant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    // Soft delete by setting deleted_at
    const deletedPlant = await prisma.plant.update({
      where: { plant_id: plantId },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json(
      { message: "Plant deleted successfully", plant: deletedPlant },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete plant" },
      { status: 500 }
    );
  }
}
