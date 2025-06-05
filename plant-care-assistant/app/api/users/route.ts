import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { getUserIdFromSupabase } from "@utils/auth";
import {
  validateUser,
  isValidationError,
  validationErrorResponse,
} from "@utils/validation";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const username = url.searchParams.get("username");

    const where: Prisma.UserProfileWhereInput = {
      deleted_at: null,
    };

    if (username) {
      where.username = { contains: username };
    }

    const users = await prisma.userProfile.findMany({
      where,
      select: {
        id: true,
        username: true,
        created_at: true,
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUserId = await getUserIdFromSupabase(request);
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.userProfile.findFirst({
      where: {
        id: currentUserId,
        deleted_at: null,
      },
    });

    if (!currentUser?.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const validationResult = validateUser(body);
    if (isValidationError(validationResult)) {
      return validationErrorResponse(validationResult);
    }

    const validUser = validationResult;

    const existingUser = await prisma.userProfile.findFirst({
      where: {
        username: validUser.username,
        deleted_at: null,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 }
      );
    }

    const newUser = await prisma.userProfile.create({
      data: {
        username: body.username,
        created_at: new Date(),
        updated_at: null,
        deleted_at: null,
      },
      select: {
        id: true,
        username: true,
        created_at: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
