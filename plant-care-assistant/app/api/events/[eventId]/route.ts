import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserIdFromSupabase } from "@utils/auth";
import {
  validateId,
  isValidationError,
  validationErrorResponse,
  validatePartialEvent, // TODO: You'll need to create this
} from "@utils/validation";

const prisma = new PrismaClient();

// Get a single event
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ eventId: string }> }
) {

  const params = await props.params;

  const userId = await getUserIdFromSupabase(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate ID parameter
  const idResult = validateId(params.eventId);
  if (isValidationError(idResult)) {
    return validationErrorResponse(idResult);
  }
  const id = idResult;

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
  request: NextRequest,
  props: { params: Promise<{ eventId: string }> }
) {

  const params = await props.params
  const userId = await getUserIdFromSupabase(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate ID parameter
  const idResult = validateId(params.eventId);
  if (isValidationError(idResult)) {
    return validationErrorResponse(idResult);
  }
  const id = idResult;

  const existingEvent = await prisma.event.findUnique({ where: { id } });

  if (!existingEvent) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (existingEvent.userId !== userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await request.json();

  // Use validatePartialEvent instead of validateEvent
  const validationResult = validatePartialEvent(body);
  if (isValidationError(validationResult)) {
    return validationErrorResponse(validationResult);
  }

  // The validated object now contains only the fields to update
  const updatedEvent = await prisma.event.update({
    where: { id },
    data: validationResult, // Use the validated data directly
  });

  return NextResponse.json(updatedEvent, { status: 200 });
}

// Delete an event
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ eventId: string }> }
) {
  const params = await props.params
  const userId = await getUserIdFromSupabase(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate ID parameter
  const idResult = validateId(params.eventId);
  if (isValidationError(idResult)) {
    return validationErrorResponse(idResult);
  }
  const id = idResult;

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
