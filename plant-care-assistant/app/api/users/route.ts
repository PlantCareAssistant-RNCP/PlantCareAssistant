import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import {
  validateUser,
  isValidationError,
  validationErrorResponse,
} from "@utils/validation";
import {
  createRequestContext,
  logRequest,
  logResponse,
  logError,
} from "@utils/apiLogger";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const context = createRequestContext(request, "/api/users");

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
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

    logResponse(context, 200, {
      userCount: users.length,
      searchUsername: username || "none",
      hasResults: users.length > 0,
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    logError(context, error as Error, {
      operation: "search_users",
    });
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const context = createRequestContext(request, "/api/users");

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.userProfile.findFirst({
      where: {
        id: context.userId,
        deleted_at: null,
      },
    });

    if (!currentUser?.isAdmin) {
      logResponse(context, 403, {
        attemptedAction: "create_user",
        isAdmin: false,
      });
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const validationResult = validateUser(body);
    if (isValidationError(validationResult)) {
      logResponse(context, 400, {
        validationError: validationResult.error,
        errorType: "validation",
      });
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
      logResponse(context, 409, {
        conflictingUsername: validUser.username,
        errorType: "username_conflict",
      });
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 }
      );
    }

    const newUser = await prisma.userProfile.create({
      data: {
        username: validUser.username,
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

    logResponse(context, 201, {
      createdUserId: newUser.id,
      createdUsername: newUser.username,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    logError(context, error as Error, {
      operation: "create_user_admin",
    });
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
