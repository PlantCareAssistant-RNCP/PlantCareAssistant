import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  isValidationError,
  validateEvent,
  validationErrorResponse,
} from "@utils/validation";
import { createRequestContext, logRequest, logResponse, logError } from "@utils/apiLogger";
import { scheduleEventNotification } from "@lib/onesignal";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const context = createRequestContext(request, '/api/events');

  try {
    await logRequest(context, request);

    if(!context.userId){
      logResponse(context, 401);
      return NextResponse.json({error: "Unauthorised"}, {status: 401});
    }

    // Fetch events for the user
    const events = await prisma.event.findMany({
      where: {
        userId: context.userId,
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

    logResponse(context,200, {eventCount: events.length})

    // Return events (even if empty array)
    return NextResponse.json(events);
  } catch (error) {
    logError(context,error as Error, {operation: "fetch_events"})
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// Create a new event
export async function POST(request: NextRequest) {
  const context = createRequestContext(request, '/api/events')
  try {

    await logRequest(context, request)

    if(!context.userId){
      logResponse(context, 401)
      return NextResponse.json({error: "Unauthorised"},{status: 401})
    }

    const body = await request.json();

    // Validate required fields
    const validationResult = validateEvent(body);
    if (isValidationError(validationResult)) {
      logResponse(context, 400, {
        validationError: validationResult.error, errorType: "validation"
      })
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
          connect: { id: context.userId },
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

    //Schedule Notification (30mins before start)
    const notificationTime = new Date(event.start);
    notificationTime.setMinutes(notificationTime.getMinutes()-30);

    const notificationResponse = await scheduleEventNotification(
      event.id,
      event.title,
      `Time for: ${event.title}`,
      notificationTime
    );

    // Extract notificationId from response
    const notificationId = notificationResponse?.notificationId;

    // Save notificationId to event
    if (notificationId) {
      await prisma.event.update({
        where: { id: event.id },
        data: { notificationId }
      });
    }

    logResponse(context, 201, {
      eventId: event.id,
      hasPlant: !!body.plantId,
      eventTitle: body.title
    });
    return NextResponse.json(event, {status: 201})

    logResponse(context, 201, {
      eventId: event.id,
      hasPlant: !!body.plantId,
      eventTitle: body.title
    });
    return NextResponse.json(event, { status: 201 });

  } catch (error) {
    logError(context, error as Error, {
      operation: "create_event",
    });
    return NextResponse.json(
      {
        error: "Failed to create event",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
