import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { getCurrentUserId, isAuthenticated } from "@utils/auth";
import { 
  validateEvent, 
  isValidationError, 
  validationErrorResponse 
} from "@/utils/validation";

const prisma = new PrismaClient();

// Get all events for a specific user
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = getCurrentUserId(req);
    const targetUserId = parseInt(params.userId);

    // Security: Users can only view their own events unless they're admin
    if (currentUserId !== targetUserId) {
      // Uncomment this in production when you have admin roles
      // const currentUser = await prisma.user.findUnique({ where: { user_id: currentUserId } });
      // if (!currentUser.isAdmin) {
      //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      // }
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if user exists
    const userExists = await prisma.user.findFirst({
      where: {
        user_id: targetUserId,
        deleted_at: null,
      },
    });

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse query parameters for filtering
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const plantId = url.searchParams.get("plantId")
      ? parseInt(url.searchParams.get("plantId")!)
      : undefined;

    // Build the where clause for filtering
    const where: Prisma.EventWhereInput = { userId: targetUserId };

    if (startDate && endDate) {
      where.start = {
        gte: new Date(startDate),
      };
      where.end = {
        lte: new Date(endDate),
      };
    }

    if (plantId) {
      where.plantId = plantId;
    }

    // Get all events for this user with filters
    const events = await prisma.event.findMany({
      where,
      include: {
        plant: true,
      },
      orderBy: {
        start: "asc",
      },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch user events" },
      { status: 500 }
    );
  }
}

// Create a new event for a specific user
export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = getCurrentUserId(req);
    const targetUserId = parseInt(params.userId);

    // Security: Users can only create events for themselves
    if (currentUserId !== targetUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if user exists
    const userExists = await prisma.user.findFirst({
      where: {
        user_id: targetUserId,
        deleted_at: null,
      },
    });

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();

    // Validate required fields
    const validationResult = validateEvent(body);
    
    if (isValidationError(validationResult)) {
      return validationErrorResponse(validationResult);
    }

    // If plantId is provided, verify it exists and belongs to this user
    if (validationResult.plantId) {
      const plantExists = await prisma.plant.findFirst({
        where: {
          plant_id: validationResult.plantId,
          user_id: targetUserId,
          deleted_at: null,
        },
      });

      if (!plantExists) {
        return NextResponse.json(
          { error: "Selected plant not found or doesn't belong to this user" },
          { status: 404 }
        );
      }
    }

    // Create the event
    const newEvent = await prisma.event.create({
      data: {
        title: validationResult.title,
        start: new Date(validationResult.start),
        end: new Date(validationResult.end),
        userId: targetUserId,
        plantId: validationResult.plantId || null,
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
