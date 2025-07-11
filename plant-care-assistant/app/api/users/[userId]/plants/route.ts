import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { getUserIdFromSupabase } from "@utils/auth";
import { 
  validatePlant, 
  isValidationError, 
  validationErrorResponse 
} from "@utils/validation";

const prisma = new PrismaClient();

// Get all plants for a specific user
export async function GET(
  request: Request,
    props: { params: Promise<{ userId: string }> } 
) {
  try {
    const params = await props.params
    const currentUserId = await getUserIdFromSupabase(request);
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = params.userId;

    // Security: Users can only view their own plants
    if (currentUserId !== targetUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if user exists
    const userExists = await prisma.userProfile.findFirst({
      where: { 
        id: targetUserId,
        deleted_at: null
      }
    });

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse query parameters for filtering
    const url = new URL(request.url);
    const plantType = url.searchParams.get('plantType') ? 
      parseInt(url.searchParams.get('plantType')!) : undefined;

    // Build the where clause for filtering
    const where: Prisma.PlantWhereInput = { 
      user_id: targetUserId,
      deleted_at: null 
    };

    if (plantType) {
      where.plant_type_id = plantType;
    }

    // Get all plants for this user with filters
    const plants = await prisma.plant.findMany({
      where,
      include: {
        PLANT_TYPE: true,
        Event: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(plants, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch user plants" }, { status: 500 });
  }
}

// Create a new plant for a specific user
export async function POST(
  request: Request,
    props: { params: Promise<{ userId: string }> } 
) {
  try {
    const params = await props.params
    const currentUserId = await getUserIdFromSupabase(request);
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = params.userId;

    // Security: Users can only create plants for themselves
    if (currentUserId !== targetUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if user exists
    const userExists = await prisma.userProfile.findFirst({
      where: { 
        id: targetUserId,
        deleted_at: null
      }
    });

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    const validationResult = validatePlant(body);
    
    if (isValidationError(validationResult)) {
      return validationErrorResponse(validationResult);
    }

    // Create the plant
    const newPlant = await prisma.plant.create({
      data: {
        plant_name: validationResult.plant_name,
        USER: {
          connect: { id: targetUserId }
        },
        PLANT_TYPE: {
          connect: { plant_type_id: validationResult.plant_type_id }
        },
        photo: validationResult.photo || "default_plant.jpg",
        created_at: new Date(),
        updated_at: null,
        deleted_at: null
      }
    });

    // Also create the USER_PLANT relationship
    await prisma.userPlant.create({
      data: {
        USER: {
          connect: { id: targetUserId }
        },
        PLANT: {
          connect: { plant_id: newPlant.plant_id }
        }
      }
    });

    return NextResponse.json(newPlant, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create plant" }, { status: 500 });
  }
}