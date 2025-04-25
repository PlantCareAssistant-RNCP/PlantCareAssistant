import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId, isAuthenticated } from "@utils/auth";

const prisma = new PrismaClient();

// List all plants for teh current user
export async function GET(req: Request) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getCurrentUserId(req);

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
export async function POST(req: Request) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getCurrentUserId(req);
    const body = await req.json();

    const newPlant = await prisma.plant.create({
      data: {
        plant_name: body.plant_name,
        user_id: userId,
        plant_type_id: body.plant_type_id,
        photo: body.photo || "default_plant.jpg",
        created_at: new Date(),
        updated_at: null,
        deleted_at: null,
      },
    });

    await prisma.userPlant.create({
        data:{
            user_id: userId,
            plant_id: newPlant.plant_id
        }
    })

    return NextResponse.json(newPlant, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create plant" },
      { status: 500 }
    );
  }
}
