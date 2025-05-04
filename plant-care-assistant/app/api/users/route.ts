import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { getCurrentUserId, isAuthenticated } from "@utils/auth";
import {
  validateUser,
  isValidationError,
  validationErrorResponse,
} from "@utils/validation";

const prisma = new PrismaClient();

// List all users (with optional filtering)
export async function GET(req: Request) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a real app, you might restrict this to admin users only
    // const userId = getCurrentUserId(req);
    // const currentUser = await prisma.user.findUnique({ where: { user_id: userId } });
    // if (!currentUser.isAdmin) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const url = new URL(req.url);
    const username = url.searchParams.get("username");

    // Build where clause for filtering
    const where: Prisma.UserWhereInput = {
      deleted_at: null,
    };

    if (username) {
      where.username = { contains: username };
    }

    // Get users with filtering
    const users = await prisma.user.findMany({
      where,
      select: {
        user_id: true,
        username: true,
        email: true,
        created_at: true,
        // Exclude password_hash for security
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

/**
 * Creates a new user (ADMIN ONLY)
 *
 * Note: This endpoint is for administrative user creation.
 * Regular user registration should use /api/auth/register instead.
 */
export async function POST(req: Request) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Check if the current user is an admin
    const currentUserId = getCurrentUserId(req);
    const currentUser = await prisma.user.findFirst({
      where: {
        user_id: currentUserId,
        deleted_at: null,
      },
    });

    // As there is no isAdmin role currently, we will need to consider implementing it.
    // Currently locked down, auth/register works for creating users
    if (!currentUser?.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate required fields
    const validationResult = validateUser(body);
    if (isValidationError(validationResult)) {
      return validationErrorResponse(validationResult);
    }

    const validUser = validationResult

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: validUser.username }, { email: validUser.email }],
        deleted_at: null,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 }
      );
    }

    // In a real app, you would hash the password
    // const hashedPassword = await bcrypt.hash(body.password, 10);
    const hashedPassword = validUser.password; // Temporary for development

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        password_hash: hashedPassword,
        created_at: new Date(),
        updated_at: null,
        deleted_at: null,
      },
      select: {
        user_id: true,
        username: true,
        email: true,
        created_at: true,
        // Again, don't return password_hash
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
