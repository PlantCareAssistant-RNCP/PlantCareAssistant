import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserIdFromSupabase } from "@utils/auth";
import {
  isValidationError,
  validateEvent,
  validationErrorResponse,
} from "@utils/validation";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    console.log("GET /api/events called");

    // Get authenticated user ID
    const userId = await getUserIdFromSupabase(request);
    console.log("User ID:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Log the user ID type for debugging
    console.log("User ID type:", typeof userId);

    // Fetch events for the user
    const events = await prisma.event.findMany({
      where: {
        userId: userId,
        // If your events have a deleted_at field, add:
        // deleted_at: null
      },
      include: {
        plant: true, // Include related plant data if needed
      },
      orderBy: {
        start: "asc", // Order by start date
      },
    });

    console.log(`Found ${events.length} events for user`);

    // Return events (even if empty array)
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// Create a new event
export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const validationResult = validateEvent(body);
    if (isValidationError(validationResult)) {
      return validationErrorResponse(validationResult);
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        title: body.title,
        start: new Date(body.start),
        end: body.end ? new Date(body.end) : null,
        // Use connect syntax for relations instead of direct ID assignment
        user: {
          connect: { id: userId },
        },
        // Only include plant relation if plantId is provided
        ...(body.plantId
          ? {
              plant: {
                connect: { plant_id: body.plantId },
              },
            }
          : {}),
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      {
        error: "Failed to create event",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
