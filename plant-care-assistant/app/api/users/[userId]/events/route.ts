import { NextResponse, NextRequest } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import {
  validateEvent,
  isValidationError,
  validationErrorResponse,
} from "@utils/validation";
import {
  createRequestContext,
  logError,
  logRequest,
  logResponse,
} from "@utils/apiLogger";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ userId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/users/${params.userId}/events`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = params.userId;

    if (context.userId !== targetUserId) {
      logResponse(context, 403, { attemptedUserId: targetUserId });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userExists = await prisma.userProfile.findFirst({
      where: {
        id: targetUserId,
        deleted_at: null,
      },
    });

    if (!userExists) {
      logResponse(context, 404, { requestedUserId: targetUserId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const plantId = url.searchParams.get("plantId")
      ? parseInt(url.searchParams.get("plantId")!)
      : undefined;

    const where: Prisma.EventWhereInput = { userId: targetUserId };

    if (startDate && endDate) {
      where.start = {
        gte: new Date(startDate),
      };
      where.end = {
        lte: new Date(endDate),
      };
    }

    if (plantId) {
      where.plantId = plantId;
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        plant: true,
      },
      orderBy: {
        start: "asc",
      },
    });

    logResponse(context, 200, {
      eventCount: events.length,
      hasDateFilter: !!(startDate && endDate),
      hasPlantFilter: !!plantId,
      targetUserId: targetUserId,
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error: unknown) {
    logError(context, error as Error, {
      operation: "fetch_user_events",
      targetUserId: params.userId,
    });
    return NextResponse.json(
      { error: "Failed to fetch user events" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ userId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(
    request,
    `/api/users/${params.userId}/events`
  );

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = params.userId;

    if (context.userId !== targetUserId) {
      logResponse(context, 403, { attemptedUserId: targetUserId });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userExists = await prisma.userProfile.findFirst({
      where: {
        id: targetUserId,
        deleted_at: null,
      },
    });

    if (!userExists) {
      logResponse(context, 404, { requestedUserId: targetUserId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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

    if (validationResult.plantId) {
      const plantExists = await prisma.plant.findFirst({
        where: {
          plant_id: validationResult.plantId,
          user_id: targetUserId,
          deleted_at: null,
        },
      });

      if (!plantExists) {
        logResponse(context, 404, {
          plantId: validationResult.plantId,
          errorType: "plant_not_found",
        });
        return NextResponse.json(
          { error: "Selected plant not found or doesn't belong to this user" },
          { status: 404 }
        );
      }
    }

    const newEvent = await prisma.event.create({
      data: {
        title: validationResult.title,
        start: new Date(validationResult.start),
        end: validationResult.end ? new Date(validationResult.end) : null,
        userId: targetUserId,
        plantId: validationResult.plantId || null,
      },
    });

    logResponse(context, 201, {
      eventId: newEvent.id,
      eventTitle: validationResult.title,
      hasPlant: !!validationResult.plantId,
      plantId: validationResult.plantId ,
      targetUserId: targetUserId,
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: unknown) {
    logError(context, error as Error, {
      operation: "create_user_event",
      targetUserId: params.userId,
    });
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
