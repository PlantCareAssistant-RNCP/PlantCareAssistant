import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  createRequestContext,
  logRequest,
  logResponse,
  logError,
} from "@utils/apiLogger";
import { isValidationError, validationErrorResponse } from "@utils/validation";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const context = createRequestContext(
    request,
    "/api/auth/create-user-profile"
  );

  try {
    await logRequest(context, request);

    const { id, username } = await request.json();

    // Minimal server-side username validation (length and charset)
    const usernameStr = String(username ?? "");
    if (usernameStr.length < 3) {
      logResponse(context, 400, { errorType: "username_min_length" });
      return NextResponse.json(
        { error: "Username must be at least 3 characters long" },
        { status: 400 }
      );
    }
    if (usernameStr.length > 30) {
      logResponse(context, 400, { errorType: "username_max_length" });
      return NextResponse.json(
        { error: "Username cannot exceed 30 characters in length" },
        { status: 400 }
      );
    }
    if (!/^[a-zA-Z0-9_]+$/.test(usernameStr)) {
      logResponse(context, 400, { errorType: "username_charset" });
      return NextResponse.json(
        {
          error: "Username can only contain letters, numbers, and underscores",
        },
        { status: 400 }
      );
    }

    // Attempt to create profile; handle unique constraint conflicts
    try {
      await prisma.userProfile.create({
        data: {
          id, // must match Supabase Auth user ID
          username: usernameStr,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      // Prisma unique constraint errors include code P2002
      if (
        message.includes("P2002") ||
        message.toLowerCase().includes("unique")
      ) {
        logResponse(context, 409, {
          errorType: "username_conflict",
          username: usernameStr,
        });
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 409 }
        );
      }
      throw err;
    }

    logResponse(context, 200, {
      createdUserId: id,
      username: username,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(context, error as Error, {
      operation: "create_user_profile",
    });
    return NextResponse.json(
      { error: "UserProfile creation failed" },
      { status: 500 }
    );
  }
}
