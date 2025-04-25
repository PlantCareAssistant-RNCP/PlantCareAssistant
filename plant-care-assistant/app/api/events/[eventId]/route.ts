import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId, isAuthenticated } from "../../../../utils/auth";

const prisma = new PrismaClient();

// Get a single event
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Optional: Add authentication check if you want to restrict event viewing
    // if (!isAuthenticated()) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    
    const id = parseInt(params.id);
    
    const event = await prisma.event.findUnique({
      where: { id },
      include: { plant: true }
    });
    
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// Update an event
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if the user is authenticated
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get the current user ID for authorization checks
    const userId = getCurrentUserId(req);
    const id = parseInt(params.id);
    
    // First check if the event exists and belongs to this user
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });
    
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    // Optional: Add ownership check when you implement real auth
    if (existingEvent.userId !== userId) {
      return NextResponse.json({ error: "Not authorized to modify this event" }, { status: 403 });
    }
    
    const body = await req.json();
    
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: body.title,
        start: body.start ? new Date(body.start) : undefined,
        end: body.end ? new Date(body.end) : undefined,
        plantId: body.plantId !== undefined ? body.plantId : undefined
      }
    });
    
    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// Delete an event
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if the user is authenticated
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get the current user ID for authorization checks
    const userId = getCurrentUserId(req);
    const id = parseInt(params.id);
    
    // First check if the event exists and belongs to this user
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });
    
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    // Optional: Add ownership check when you implement real auth
    if (existingEvent.userId !== userId) {
      return NextResponse.json({ error: "Not authorized to delete this event" }, { status: 403 });
    }
    
    await prisma.event.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}