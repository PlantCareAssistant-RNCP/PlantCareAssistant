import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import {
  validationErrorResponse,
  isValidationError,
  validatePartialUser,
} from "@utils/validation";
import {
  createRequestContext,
  logRequest,
  logResponse,
  logError,
} from "@utils/apiLogger";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

// Get a single user by ID
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ userId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(request, `/api/users/${params.userId}`);

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
      logResponse(context, 404, { requestedUserId: targetUserId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    logResponse(context, 200, {
      targetUserId: targetUserId,
      hasUsername: !!user.username,
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    logError(context, error as Error, {
      operation: "fetch_user_profile",
      targetUserId: params.userId,
    });
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// Update a user
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ userId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(request, `/api/users/${params.userId}`);

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

    const body = await request.json();

    const validationResult = validatePartialUser(body);

    if (isValidationError(validationResult)) {
      logResponse(context, 400, {
        validationError: validationResult.error,
        errorType: "validation",
      });
      return validationErrorResponse(validationResult);
    }

    if (Object.keys(validationResult).length === 0) {
      logResponse(context, 400, { errorType: "no_fields_to_update" });
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.userProfile.findFirst({
      where: {
        id: targetUserId,
        deleted_at: null,
      },
    });

    if (!existingUser) {
      logResponse(context, 404, { requestedUserId: targetUserId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (validationResult.username) {
      const conflicts = await prisma.userProfile.findFirst({
        where: {
          username: validationResult.username,
          NOT: { id: targetUserId },
          deleted_at: null,
        },
      });

      if (conflicts) {
        logResponse(context, 409, {
          conflictingUsername: validationResult.username,
          errorType: "username_conflict",
        });
        return NextResponse.json(
          { error: "Username already in use" },
          { status: 409 }
        );
      }
    }

    const updateData: Prisma.UserProfileUpdateInput = {
      updated_at: new Date(),
    };

    if (validationResult.username)
      updateData.username = validationResult.username;

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

    logResponse(context, 200, {
      targetUserId: targetUserId,
      updatedFields: Object.keys(validationResult).join(", "),
      newUsername: validationResult.username || "unchanged",
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    logError(context, error as Error, {
      operation: "update_user_profile",
      targetUserId: params.userId,
    });
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// Delete a user (soft delete)
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ userId: string }> }
) {
  const params = await props.params;
  const context = createRequestContext(request, `/api/users/${params.userId}`);

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

    const existingUser = await prisma.userProfile.findFirst({
      where: {
        id: targetUserId,
        deleted_at: null,
      },
    });

    if (!existingUser) {
      logResponse(context, 404, { requestedUserId: targetUserId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.userProfile.update({
      where: { id: targetUserId },
      data: { deleted_at: new Date() },
    });

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );
    const { error: supabaseError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (supabaseError) {
      logError(context, supabaseError, { operation: "delete_supabase_user" });
      return NextResponse.json(
        { error: "User soft-deleted, but failed to delete from Supabase Auth", details: supabaseError.message },
        { status: 500 }
      );
    }

    logResponse(context, 200, {
      deletedUserId: targetUserId,
      deletedUsername: existingUser.username || "no_username",
      supabaseAuthDeleted: true,
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    logError(context, error as Error, {
      operation: "delete_user_profile",
      targetUserId: params.userId,
    });
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
