import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId, isAuthenticated } from "@utils/auth";

const prisma = new PrismaClient();

// Get all events for a specific plant
export async function GET(
  request: Request,
  { params }: { params: { plantId: string } }
) {
  try {
if (!isAuthenticated(request)) {  // or request in some files
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

    const userId = getCurrentUserId(request);
    const plantId = parseInt(params.plantId);

    // First check if the plant exists and belongs to the user
    const plant = await prisma.plant.findFirst({
      where: {
        plant_id: plantId,
        user_id: userId,
        deleted_at: null
      }
    });

    if (!plant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    // Get all events for this plant
    const events = await prisma.event.findMany({
      where: {
        plantId: plantId
      },
      orderBy: {
        start: 'asc'
      }
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch plant events" }, { status: 500 });
  }
}

// Create a new event for a specific plant
export async function POST(
  request: Request,
  { params }: { params: { plantId: string } }
) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getCurrentUserId(request);
    const plantId = parseInt(params.plantId);
    const body = await request.json();

    // Check if the plant exists and belongs to the user
    const plant = await prisma.plant.findFirst({
      where: {
        plant_id: plantId,
        user_id: userId,
        deleted_at: null
      }
    });

    if (!plant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    // Validate required fields
    if (!body.title || !body.start || !body.end) {
      return NextResponse.json(
        { error: "Title, start time, and end time are required" },
        { status: 400 }
      );
    }

    // Create the event
    const newEvent = await prisma.event.create({
      data: {
        title: body.title,
        start: new Date(body.start),
        end: new Date(body.end),
        userId: userId,
        plantId: plantId
      }
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}