import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  createRequestContext,
  logRequest,
  logResponse,
  logError,
} from "@utils/apiLogger";
import { scheduleEventNotification } from "@lib/onesignal";

const prisma = new PrismaClient();

// Get all events for a specific plant
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ plantId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/plants/${params.plantId}/events`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plantId = parseInt(params.plantId);

    const plant = await prisma.plant.findFirst({
      where: {
        plant_id: plantId,
        user_id: context.userId,
        deleted_at: null,
      },
    });

    if (!plant) {
      logResponse(context, 404, { plantId: plantId });
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    const events = await prisma.event.findMany({
      where: {
        plantId: plantId,
      },
      orderBy: {
        start: "asc",
      },
    });

    logResponse(context, 200, {
      plantId: plantId,
      eventCount: events.length,
      plantName: plant.plant_name,
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    logError(context, error as Error, {
      operation: "fetch_plant_events",
      plantId: params.plantId,
    });
    return NextResponse.json(
      { error: "Failed to fetch plant events" },
      { status: 500 }
    );
  }
}

// Create a new event for a specific plant
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ plantId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/plants/${params.plantId}/events`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plantId = parseInt(params.plantId);
    const body = await request.json();

    const plant = await prisma.plant.findFirst({
      where: {
        plant_id: plantId,
        user_id: context.userId,
        deleted_at: null,
      },
    });

    if (!plant) {
      logResponse(context, 404, { plantId: plantId });
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    if (!body.title || !body.start || !body.end) {
      logResponse(context, 400, {
        missingFields: !body.title ? "title" : !body.start ? "start" : "end",
        errorType: "validation",
      });
      return NextResponse.json(
        { error: "Title, start time, and end time are required" },
        { status: 400 }
      );
    }

    const newEvent = await prisma.event.create({
      data: {
        title: body.title,
        start: new Date(body.start),
        end: new Date(body.end),
        userId: context.userId,
        plantId: plantId,
      },
    });

    const notificationTime = new Date(newEvent.start);
    notificationTime.setMinutes(notificationTime.getMinutes() - 30);

    await scheduleEventNotification(
      newEvent.id,
      newEvent.title,
      `Time for: ${newEvent.title}`,
      notificationTime
    );

    logResponse(context, 201, {
      eventId: newEvent.id,
      plantId: plantId,
      eventTitle: body.title,
      startTime: body.start,
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    logError(context, error as Error, {
      operation: "create_plant_event",
      plantId: params.plantId,
    });
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
