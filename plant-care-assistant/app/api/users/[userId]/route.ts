import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { getCurrentUserId, isAuthenticated } from "@utils/auth";
import { validateEmail, validationErrorResponse } from "@/utils/validation";

const prisma = new PrismaClient();

// Get a single user by ID
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = getCurrentUserId(req);
    const targetUserId = parseInt(params.userId);

    // Security: Users can only view their own profile unless they're admin
    // In a production app, you would check if current user is admin
    if (currentUserId !== targetUserId) {
      // Uncomment this in production when you have admin roles
      // const currentUser = await prisma.user.findUnique({ where: { user_id: currentUserId } });
      // if (!currentUser.isAdmin) {
      //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      // }
    }

    const user = await prisma.user.findFirst({
      where: {
        user_id: targetUserId,
        deleted_at: null,
      },
      select: {
        user_id: true,
        username: true,
        email: true,
        created_at: true,
        // Don't include password_hash
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
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = getCurrentUserId(req);
    const targetUserId = parseInt(params.userId);

    // Security: Users can only update their own profile
    if (currentUserId !== targetUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // 1. Validate username if provided
    if (body.username !== undefined) {
      if (typeof body.username !== "string") {
        return NextResponse.json(
          { error: "Username must be a string" },
          { status: 400 }
        );
      }

      if (body.username.length < 3) {
        return NextResponse.json(
          { error: "Username must be at least 3 characters long" },
          { status: 400 }
        );
      }

      if (body.username.length > 30) {
        return NextResponse.json(
          { error: "Username cannot exceed 30 characters" },
          { status: 400 }
        );
      }

      if (!/^[a-zA-Z0-9_]+$/.test(body.username)) {
        return NextResponse.json(
          {
            error:
              "Username can only contain letters, numbers, and underscores",
          },
          { status: 400 }
        );
      }
    }

    // 2. Validate email if provided
    if (body.email !== undefined) {
      const emailError = validateEmail(body.email);
      if (emailError) {
        return validationErrorResponse(emailError);
      }
    }

    // 3. Validate password if provided
    if (body.password !== undefined) {
      if (typeof body.password !== "string") {
        return NextResponse.json(
          { error: "Password must be a string" },
          { status: 400 }
        );
      }

      if (body.password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters long" },
          { status: 400 }
        );
      }

      const hasUpperCase = /[A-Z]/.test(body.password);
      const hasLowerCase = /[a-z]/.test(body.password);
      const hasNumbers = /\d/.test(body.password);

      if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
        return NextResponse.json(
          {
            error:
              "Password must contain uppercase letters, lowercase letters, and numbers",
          },
          { status: 400 }
        );
      }
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        user_id: targetUserId,
        deleted_at: null,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if new username or email already exists
    if (body.username || body.email) {
      const conflicts = await prisma.user.findFirst({
        where: {
          OR: [
            body.username ? { username: body.username } : {},
            body.email ? { email: body.email } : {},
          ],
          NOT: { user_id: targetUserId },
          deleted_at: null,
        },
      });

      if (conflicts) {
        return NextResponse.json(
          { error: "Username or email already in use" },
          { status: 409 }
        );
      }
    }

    // Prepare data for update
    const updateData: Prisma.UserUpdateInput = {
      updated_at: new Date(),
    };

    // Only update fields that are provided
    if (body.username) updateData.username = body.username;
    if (body.email) updateData.email = body.email;

    // If updating password, hash it
    // In production, you would use bcrypt:
    // if (body.password) {
    //   updateData.password_hash = await bcrypt.hash(body.password, 10);
    // }
    if (body.password) {
      updateData.password_hash = body.password; // Temporary for development
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { user_id: targetUserId },
      data: updateData,
      select: {
        user_id: true,
        username: true,
        email: true,
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
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = getCurrentUserId(req);
    const targetUserId = parseInt(params.userId);

    // Security: Users can only delete their own account (unless admin)
    if (currentUserId !== targetUserId) {
      // Uncomment for admin functionality
      // const currentUser = await prisma.user.findUnique({ where: { user_id: currentUserId } });
      // if (!currentUser.isAdmin) {
      //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      // }
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        user_id: targetUserId,
        deleted_at: null,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Soft delete the user
    await prisma.user.update({
      where: { user_id: targetUserId },
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
