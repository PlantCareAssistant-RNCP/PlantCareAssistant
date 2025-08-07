import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  validateId,
  isValidationError,
  validationErrorResponse,
  validatePartialEvent,
  validateEvent,
} from "@utils/validation";
import {
  createRequestContext,
  logRequest,
  logResponse,
  logError,
} from "@utils/apiLogger";
import { scheduleEventNotification } from "@lib/onesignal";
import type { ValidEvent } from "@utils/validation"; // Add this import if ValidEvent is exported from validation utils

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
        errorType: "event_validation",
      });
      return validationErrorResponse(validationResult);
    }

    // Update the master event
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: validationResult,
    });

    // Schedule notification for master event
    const notificationTime = new Date(updatedEvent.start);
    notificationTime.setMinutes(notificationTime.getMinutes() - 30);

    const masterNotif = await scheduleEventNotification(
      updatedEvent.id,
      updatedEvent.title,
      `Time for: ${updatedEvent.title}`,
      notificationTime
    );
    if (masterNotif?.notificationId) {
      await prisma.event.update({
        where: { id: updatedEvent.id },
        data: { notificationId: masterNotif.notificationId },
      });
    }

    // Handle weekly recurring
    if (body.repeatWeekly) {
      await prisma.event.deleteMany({
        where: {
          parentEventId: updatedEvent.id,
          isRecurringInstance: true,
        },
      });

      // Create new weekly instances
      const instances = [];
      let currentDate = new Date(updatedEvent.start);

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

        // Fetch created instances to get their IDs
        const createdInstances = await prisma.event.findMany({
          where: {
            parentEventId: updatedEvent.id,
            isRecurringInstance: true,
          },
        });

        // Schedule notifications for each instance
        for (const instance of createdInstances) {
          const notifTime = new Date(instance.start);
          notifTime.setMinutes(notifTime.getMinutes() - 30);

          const notif = await scheduleEventNotification(
            instance.id,
            instance.title,
            `Time for: ${instance.title}`,
            notifTime
          );
          if (notif?.notificationId) {
            await prisma.event.update({
              where: { id: instance.id },
              data: { notificationId: notif.notificationId },
            });
          }
        }
      }
    }

    // Handle monthly recurring (same logic as weekly, just change date math)
    if (body.repeatMonthly) {
      await prisma.event.deleteMany({
        where: {
          parentEventId: updatedEvent.id,
          isRecurringInstance: true,
        },
      });

      const instances = [];
      let currentDate = new Date(updatedEvent.start);

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

        const createdInstances = await prisma.event.findMany({
          where: {
            parentEventId: updatedEvent.id,
            isRecurringInstance: true,
          },
        });

        for (const instance of createdInstances) {
          const notifTime = new Date(instance.start);
          notifTime.setMinutes(notifTime.getMinutes() - 30);

          const notif = await scheduleEventNotification(
            instance.id,
            instance.title,
            `Time for: ${instance.title}`,
            notifTime
          );
          if (notif?.notificationId) {
            await prisma.event.update({
              where: { id: instance.id },
              data: { notificationId: notif.notificationId },
            });
          }
        }
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
      newTitle: !isValidationError(validationResult) && validationResult.title ? validationResult.title : "unchanged",
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

async function cancelNotification(notificationId: string) {
  await fetch(
    `https://onesignal.com/api/v1/notifications/${notificationId}?app_id=${process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
}

// Delete an event with robust parentEventId checks
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

    // Cancel notification for the event itself
    if (existingEvent.notificationId) {
      await cancelNotification(existingEvent.notificationId);
    }

    // Handle recurring instance deletion
    if (existingEvent.isRecurringInstance) {
      // Robust parentEventId check
      if (!existingEvent.parentEventId) {
        logError(context, new Error("Recurring instance missing parentEventId"), {
          eventId: id,
        });
        return NextResponse.json(
          { error: "Invalid recurring event structure: missing parentEventId" },
          { status: 400 }
        );
      }
      const parentId = existingEvent.parentEventId;

      // Cancel notifications for all instances in the series
      const childInstances = await prisma.event.findMany({
        where: {
          parentEventId: parentId,
          isRecurringInstance: true,
        },
      });
      for (const instance of childInstances) {
        if (instance.notificationId) {
          await cancelNotification(instance.notificationId);
        }
      }
      // Cancel notification for the master event
      const masterEvent = await prisma.event.findUnique({ where: { id: parentId } });
      if (masterEvent?.notificationId) {
        await cancelNotification(masterEvent.notificationId);
      }
      // Delete all instances and master event
      await prisma.event.deleteMany({
        where: {
          parentEventId: parentId,
          isRecurringInstance: true,
        },
      });
      await prisma.event.delete({ where: { id: parentId } });

      logResponse(context, 200, {
        deletedEventId: id,
        deletedEventTitle: existingEvent.title,
        deletionType: "recurring_series",
      });

      return NextResponse.json(
        { message: "Recurring event series deleted successfully" },
        { status: 200 }
      );
    }

    // Handle master recurring event deletion
    if (
      existingEvent.parentEventId === null &&
      !existingEvent.isRecurringInstance
    ) {
      // Cancel notifications for all child instances
      const childInstances = await prisma.event.findMany({
        where: {
          parentEventId: id,
          isRecurringInstance: true,
        },
      });
      for (const instance of childInstances) {
        if (instance.notificationId) {
          await cancelNotification(instance.notificationId);
        }
      }
      // Cancel notification for the master event
      if (existingEvent.notificationId) {
        await cancelNotification(existingEvent.notificationId);
      }
      await prisma.event.deleteMany({
        where: {
          parentEventId: id,
          isRecurringInstance: true,
        },
      });
      await prisma.event.delete({ where: { id } });

      logResponse(context, 200, {
        deletedEventId: id,
        deletedEventTitle: existingEvent.title,
        deletionType: "recurring_master",
      });

      return NextResponse.json(
        { message: "Recurring event series deleted successfully" },
        { status: 200 }
      );
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

// Create a new event
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ eventId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(request, `/api/events`);

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = validateEvent(body);
    if (isValidationError(validationResult)) {
      logResponse(context, 400, {
        validationError: validationResult.error,
        errorType: "validation",
      });
      return validationErrorResponse(validationResult);
    }

    // TypeScript doesn't narrow the type, so assert it:
    const validEvent = validationResult as Partial<ValidEvent>;

    const event = await prisma.event.create({
      data: {
        title: validEvent.title ?? "Untitled Event",
        start: new Date(validEvent.start!),
        end: validEvent.end ? new Date(validEvent.end) : null,
        userId: context.userId,
        plantId: validEvent.plantId ?? null,
      },
    });

    // Schedule notification (30 mins before start)
    const notificationTime = new Date(event.start);
    notificationTime.setMinutes(notificationTime.getMinutes() - 30);

    const notificationResponse = await scheduleEventNotification(
      event.id,
      event.title,
      `Time for: ${event.title}`,
      notificationTime
    );

    // Save notificationId to event if available
    if (notificationResponse?.notificationId) {
      await prisma.event.update({
        where: { id: event.id },
        data: { notificationId: notificationResponse.notificationId },
      });
    }

    // Handle weekly recurring
    if (body.repeatWeekly) {
      const instances = [];
      let currentDate = new Date(event.start);

      for (let i = 1; i <= 52; i++) {
        currentDate.setDate(currentDate.getDate() + 7);
        const duration = event.end
          ? event.end.getTime() - event.start.getTime()
          : 3600000;

        instances.push({
          title: event.title,
          start: new Date(currentDate),
          end: new Date(currentDate.getTime() + duration),
          userId: event.userId,
          plantId: event.plantId,
          parentEventId: event.id,
          isRecurringInstance: true,
        });
      }

      if (instances.length > 0) {
        await prisma.event.createMany({ data: instances });

        // Fetch created instances to get their IDs
        const createdInstances = await prisma.event.findMany({
          where: {
            parentEventId: event.id,
            isRecurringInstance: true,
          },
        });

        // Schedule notifications for each instance
        for (const instance of createdInstances) {
          const notifTime = new Date(instance.start);
          notifTime.setMinutes(notifTime.getMinutes() - 30);

          const notif = await scheduleEventNotification(
            instance.id,
            instance.title,
            `Time for: ${instance.title}`,
            notifTime
          );
          if (notif?.notificationId) {
            await prisma.event.update({
              where: { id: instance.id },
              data: { notificationId: notif.notificationId },
            });
          }
        }
      }
    }

    // Handle monthly recurring
    if (body.repeatMonthly) {
      const instances = [];
      let currentDate = new Date(event.start);

      for (let i = 1; i <= 12; i++) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        const duration = event.end
          ? event.end.getTime() - event.start.getTime()
          : 3600000;

        instances.push({
          title: event.title,
          start: new Date(currentDate),
          end: new Date(currentDate.getTime() + duration),
          userId: event.userId,
          plantId: event.plantId,
          parentEventId: event.id,
          isRecurringInstance: true,
        });
      }

      if (instances.length > 0) {
        await prisma.event.createMany({ data: instances });

        const createdInstances = await prisma.event.findMany({
          where: {
            parentEventId: event.id,
            isRecurringInstance: true,
          },
        });

        for (const instance of createdInstances) {
          const notifTime = new Date(instance.start);
          notifTime.setMinutes(notifTime.getMinutes() - 30);

          const notif = await scheduleEventNotification(
            instance.id,
            instance.title,
            `Time for: ${instance.title}`,
            notifTime
          );
          if (notif?.notificationId) {
            await prisma.event.update({
              where: { id: instance.id },
              data: { notificationId: notif.notificationId },
            });
          }
        }
      }
    }

    logResponse(context, 201, {
      eventId: event.id,
      eventTitle: event.title,
      hasPlant: !!event.plantId,
      plantId: event.plantId,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    logError(context, error as Error, {
      operation: "create_event",
      eventId: params.eventId,
    });
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
