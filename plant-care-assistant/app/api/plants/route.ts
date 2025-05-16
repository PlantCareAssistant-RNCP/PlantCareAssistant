import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId, isAuthenticated } from "@/utils/auth";
import { validatePlant, isValidationError, validationErrorResponse } from "@/utils/validation";

const prisma = new PrismaClient();

// List all plants for the current user
export async function GET(request: Request) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getCurrentUserId(request);

    const plants = await prisma.plant.findMany({
      where: { user_id: userId, deleted_at: null },
      include: { PLANT_TYPE: true, Event: true },
    });

    return NextResponse.json(plants, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch plants" },
      { status: 500 }
    );
  }
}

// Create a new plant
export async function POST(request: Request) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getCurrentUserId(request);
    const body = await request.json();

    // Validate plant data
    const validationResult = validatePlant(body);
    if (isValidationError(validationResult)) {
      return validationErrorResponse(validationResult);
    }

    const validPlant = validationResult;

    // Create the plant with validated data
    const newPlant = await prisma.plant.create({
      data: {
        plant_name: validPlant.plant_name,
        user_id: userId,
        plant_type_id: validPlant.plant_type_id,
        photo: validPlant.photo || "default_plant.jpg",
        created_at: new Date(),
        updated_at: null,
        deleted_at: null,
      },
    });

    await prisma.userPlant.create({
      data: {
        user_id: userId,
        plant_id: newPlant.plant_id
      }
    });

    return NextResponse.json(newPlant, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create plant" },
      { status: 500 }
    );
  }
}