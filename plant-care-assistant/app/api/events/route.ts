import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId, isAuthenticated } from "@utils/auth";

const prisma = new PrismaClient();

// List all events (optionally for a specific user)
export async function GET() {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getCurrentUserId();

    const events = await prisma.event.findMany({
      where: { userId },
      include: { plant: true }
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// Create a new event
export async function POST(req: Request) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getCurrentUserId(req);
    const body = await req.json();

    const newEvent = await prisma.event.create({
      data: {
        title: body.title,
        start: new Date(body.start),
        end: new Date(body.end),
        plantId: body.plantId,
        userId
      }
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}