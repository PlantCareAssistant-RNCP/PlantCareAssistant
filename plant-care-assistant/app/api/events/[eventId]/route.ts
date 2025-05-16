import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserIdFromSupabase } from "@utils/auth";

const prisma = new PrismaClient();

// Get a single event
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getUserIdFromSupabase(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = parseInt(params.id);

  const event = await prisma.event.findUnique({
    where: { id },
    include: { plant: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event, { status: 200 });
}

// Update an event
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getUserIdFromSupabase(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = parseInt(params.id);
  const existingEvent = await prisma.event.findUnique({ where: { id } });

  if (!existingEvent) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (existingEvent.userId !== userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await request.json();

  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      title: body.title,
      start: body.start ? new Date(body.start) : undefined,
      end: body.end ? new Date(body.end) : undefined,
      plantId: body.plantId !== undefined ? body.plantId : undefined,
    },
  });

  return NextResponse.json(updatedEvent, { status: 200 });
}

// Delete an event
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getUserIdFromSupabase(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = parseInt(params.id);
  const existingEvent = await prisma.event.findUnique({ where: { id } });

  if (!existingEvent) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (existingEvent.userId !== userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await prisma.event.delete({ where: { id } });

  return NextResponse.json(
    { message: "Event deleted successfully" },
    { status: 200 }
  );
}
