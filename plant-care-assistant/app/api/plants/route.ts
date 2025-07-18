import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserIdFromSupabase } from "@utils/auth";
import {
  validatePlant,
  isValidationError,
  validationErrorResponse,
} from "@utils/validation";
import logger from "@utils/logger";

const prisma = new PrismaClient();

// List all plants for the current user
export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plants = await prisma.plant.findMany({
      where: { user_id: userId, deleted_at: null },
      include: { PLANT_TYPE: true, Event: true },
    });

    return NextResponse.json(plants, { status: 200 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json(
      { error: "Failed to fetch plants" },
      { status: 500 }
    );
  }
}

// Create a new plant
export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        photo: validPlant.photo || "default_plant.jpg",
        created_at: new Date(),
        updated_at: null,
        deleted_at: null,
        USER: {
          connect: { id: userId },
        },
        PLANT_TYPE: {
          connect: { plant_type_id: validPlant.plant_type_id },
        },
      },
    });

    await prisma.userPlant.create({
      data: {
        USER: {
          connect: { id: userId },
        },
        PLANT: {
          connect: { plant_id: newPlant.plant_id },
        },
      },
    });

    return NextResponse.json(newPlant, { status: 201 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json(
      { error: "Failed to create plant" },
      { status: 500 }
    );
  }
}
