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

    if (body.repeatWeekly) {
      await prisma.event.deleteMany({
        where: {
          parentEventId: updatedEvent.id,
          isRecurringInstance: true,
        },
      });

      // Create new weekly instances
      const instances = [];
      const currentDate = new Date(updatedEvent.start);

      for (let i = 1; i <= 52; i++) {
        currentDate.setDate(currentDate.getDate() + 7);
        const duration = updatedEvent.end
          ? updatedEvent.end.getTime() - updatedEvent.start.getTime()
          : 3600000;

        instances.push({
          title: updatedEvent.title,
          start: new Date(currentDate),
          end: new Date(currentDate.getTime() + duration),
          userId: updatedEvent.userId,
          plantId: updatedEvent.plantId,
          parentEventId: updatedEvent.id,
          isRecurringInstance: true,
        });
      }

      if (instances.length > 0) {
        await prisma.event.createMany({ data: instances });
      }
    }

    if (body.repeatMonthly) {
      // First, delete any existing recurring instances for this event
      await prisma.event.deleteMany({
        where: {
          parentEventId: updatedEvent.id,
          isRecurringInstance: true,
        },
      });

      // Create new monthly instances
      const instances = [];
      const currentDate = new Date(updatedEvent.start);

      for (let i = 1; i <= 12; i++) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        const duration = updatedEvent.end
          ? updatedEvent.end.getTime() - updatedEvent.start.getTime()
          : 3600000;

        instances.push({
          title: updatedEvent.title,
          start: new Date(currentDate),
          end: new Date(currentDate.getTime() + duration),
          userId: updatedEvent.userId,
          plantId: updatedEvent.plantId,
          parentEventId: updatedEvent.id,
          isRecurringInstance: true,
        });
      }

      if (instances.length > 0) {
        await prisma.event.createMany({ data: instances });
      }
    }

    // If neither repeatWeekly nor repeatMonthly, delete any existing instances
    if (!body.repeatWeekly && !body.repeatMonthly) {
      await prisma.event.deleteMany({
        where: {
          parentEventId: updatedEvent.id,
          isRecurringInstance: true,
        },
      });
    }

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

    // Enhanced deletion logic for recurring events
    if (existingEvent.isRecurringInstance) {
      // If deleting a recurring instance, delete the entire series
      const parentId = existingEvent.parentEventId;

      // Delete all instances of this recurring event
      const deletedInstances = await prisma.event.deleteMany({
        where: {
          parentEventId: parentId,
          isRecurringInstance: true,
        },
      });

      // Delete the master/parent event
      if (parentId) {
        await prisma.event.delete({ where: { id: parentId } });
      }

      logResponse(context, 200, {
        deletedEventId: id,
        deletedEventTitle: existingEvent.title,
        deletionType: "recurring_series",
        instancesDeleted: deletedInstances.count,
        parentEventDeleted: !!parentId,
      });

      return NextResponse.json(
        {
          message: "Recurring event series deleted successfully",
          instancesDeleted: deletedInstances.count + 1, // +1 for the master event
        },
        { status: 200 }
      );
    } else if (
      existingEvent.parentEventId === null &&
      !existingEvent.isRecurringInstance
    ) {
      // Check if this is a master recurring event (has children)
      const childInstances = await prisma.event.findMany({
        where: {
          parentEventId: id,
          isRecurringInstance: true,
        },
      });

      if (childInstances.length > 0) {
        // This is a master recurring event, delete all instances first
        const deletedInstances = await prisma.event.deleteMany({
          where: {
            parentEventId: id,
            isRecurringInstance: true,
          },
        });

        // Then delete the master event
        await prisma.event.delete({ where: { id } });

        logResponse(context, 200, {
          deletedEventId: id,
          deletedEventTitle: existingEvent.title,
          deletionType: "recurring_master",
          instancesDeleted: deletedInstances.count,
        });

        return NextResponse.json(
          {
            message: "Recurring event series deleted successfully",
            instancesDeleted: deletedInstances.count + 1, // +1 for the master event
          },
          { status: 200 }
        );
      }
    }

    // Regular single event deletion
    await prisma.event.delete({ where: { id } });

    logResponse(context, 200, {
      deletedEventId: id,
      deletedEventTitle: existingEvent.title,
      deletionType: "single_event",
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
