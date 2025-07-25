import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  validateId,
  isValidationError,
  validationErrorResponse,
  validatePartialEvent,
} from "@utils/validation";
import {
  createRequestContext,
  logRequest,
  logResponse,
  logError,
} from "@utils/apiLogger";

const prisma = new PrismaClient();

// Get a single event
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ eventId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/events/${params.eventId}`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idResult = validateId(params.eventId);
    if (isValidationError(idResult)) {
      logResponse(context, 400, {
        validationError: idResult.error,
        errorType: "id_validation",
      });
      return validationErrorResponse(idResult);
    }
    const id = idResult;

    const event = await prisma.event.findUnique({
      where: { id },
      include: { plant: true },
    });

    if (!event) {
      logResponse(context, 404, { eventId: id });
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.userId !== context.userId) {
      logResponse(context, 403, { eventId: id, eventOwnerId: event.userId });
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    logResponse(context, 200, {
      eventId: id,
      eventTitle: event.title,
      hasPlant: !!event.plant,
      plantId: event.plantId,
    });

    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    logError(context, error as Error, {
      operation: "fetch_single_event",
      eventId: params.eventId,
    });
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// Update an event
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ eventId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/events/${params.eventId}`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idResult = validateId(params.eventId);
    if (isValidationError(idResult)) {
      logResponse(context, 400, {
        validationError: idResult.error,
        errorType: "id_validation",
      });
      return validationErrorResponse(idResult);
    }
    const id = idResult;

    const existingEvent = await prisma.event.findUnique({ where: { id } });

    if (!existingEvent) {
      logResponse(context, 404, { eventId: id });
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (existingEvent.userId !== context.userId) {
      logResponse(context, 403, {
        eventId: id,
        eventOwnerId: existingEvent.userId,
      });
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();

    const validationResult = validatePartialEvent(body);
    if (isValidationError(validationResult)) {
      logResponse(context, 400, {
        validationError: validationResult.error,
        errorType: "validation",
      });
      return validationErrorResponse(validationResult);
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: validationResult,
    });

    logResponse(context, 200, {
      eventId: id,
      updatedFields: Object.keys(validationResult).join(", "),
      newTitle: validationResult.title || "unchanged",
    });

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    logError(context, error as Error, {
      operation: "update_event",
      eventId: params.eventId,
    });
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// Delete an event
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ eventId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/events/${params.eventId}`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idResult = validateId(params.eventId);
    if (isValidationError(idResult)) {
      logResponse(context, 400, {
        validationError: idResult.error,
        errorType: "id_validation",
      });
      return validationErrorResponse(idResult);
    }
    const id = idResult;

    const existingEvent = await prisma.event.findUnique({ where: { id } });

    if (!existingEvent) {
      logResponse(context, 404, { eventId: id });
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (existingEvent.userId !== context.userId) {
      logResponse(context, 403, {
        eventId: id,
        eventOwnerId: existingEvent.userId,
      });
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.event.delete({ where: { id } });

    logResponse(context, 200, {
      deletedEventId: id,
      deletedEventTitle: existingEvent.title,
    });

    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    logError(context, error as Error, {
      operation: "delete_event",
      eventId: params.eventId,
    });
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
