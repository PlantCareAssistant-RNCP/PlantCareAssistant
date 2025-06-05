import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { getUserIdFromSupabase } from "@utils/auth";
import {
  validationErrorResponse,
  isValidationError,
  validatePartialUser,
} from "@utils/validation";

const prisma = new PrismaClient();

// Get a single user by ID
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const currentUserId = await getUserIdFromSupabase(request);
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = params.userId;

    // Security: Users can only view their own profile
    if (currentUserId !== targetUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.userProfile.findFirst({
      where: {
        id: targetUserId,
        deleted_at: null,
      },
      select: {
        id: true,
        username: true,
        created_at: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// Update a user
export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const currentUserId = await getUserIdFromSupabase(request);
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = params.userId;

    // Security: Users can only update their own profile
    if (currentUserId !== targetUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const validationResult = validatePartialUser(body);

    // Check if validation failed
    if (isValidationError(validationResult)) {
      return validationErrorResponse(validationResult);
    }

    // If validation passed but no fields to update were provided
    if (Object.keys(validationResult).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.userProfile.findFirst({
      where: {
        id: targetUserId,
        deleted_at: null,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if new username already exists
    if (validationResult.username) {
      const conflicts = await prisma.userProfile.findFirst({
        where: {
          username: validationResult.username,
          NOT: { id: targetUserId },
          deleted_at: null,
        },
      });

      if (conflicts) {
        return NextResponse.json(
          { error: "Username already in use" },
          { status: 409 }
        );
      }
    }

    // Prepare data for update
    const updateData: Prisma.UserProfileUpdateInput = {
      updated_at: new Date(),
    };

    // Only update fields that are provided
    if (validationResult.username)
      updateData.username = validationResult.username;

    // Update the user
    const updatedUser = await prisma.userProfile.update({
      where: { id: targetUserId },
      data: updateData,
      select: {
        id: true,
        username: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// Delete a user (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const currentUserId = await getUserIdFromSupabase(request);
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = params.userId;

    // Security: Users can only delete their own account
    if (currentUserId !== targetUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if user exists
    const existingUser = await prisma.userProfile.findFirst({
      where: {
        id: targetUserId,
        deleted_at: null,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Soft delete the user
    await prisma.userProfile.update({
      where: { id: targetUserId },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}