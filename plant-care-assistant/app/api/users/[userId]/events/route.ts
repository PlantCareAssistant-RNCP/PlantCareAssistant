import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { getUserIdFromSupabase } from "@utils/auth";
import {
  validateEvent,
  isValidationError,
  validationErrorResponse,
} from "@utils/validation";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  props: { params: Promise<{ userId: string }> }
) {
  try {
    const params = await props.params;
    const currentUserId = await getUserIdFromSupabase(request);
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = params.userId;

    if (currentUserId !== targetUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userExists = await prisma.userProfile.findFirst({
      where: {
        id: targetUserId,
        deleted_at: null,
      },
    });

    if (!userExists) {
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

    return NextResponse.json(events, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch user events" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ userId: string }> }
) {
  try {
    const params = await props.params;
    const currentUserId = await getUserIdFromSupabase(request);
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = params.userId;

    if (currentUserId !== targetUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userExists = await prisma.userProfile.findFirst({
      where: {
        id: targetUserId,
        deleted_at: null,
      },
    });

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    const validationResult = validateEvent(body);

    if (isValidationError(validationResult)) {
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
        USER: {
          connect: { id: targetUserId },
        },
        PLANT: validationResult.plantId
          ? {
              connect: { plant_id: validationResult.plantId },
            }
          : undefined,
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
