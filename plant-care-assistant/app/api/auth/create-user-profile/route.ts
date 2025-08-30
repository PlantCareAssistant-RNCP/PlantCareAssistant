import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  createRequestContext,
  logRequest,
  logResponse,
  logError,
} from "@utils/apiLogger";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const context = createRequestContext(
    request,
    "/api/auth/create-user-profile"
  );

  try {
    await logRequest(context, request);

    const { id, username } = await request.json();

    await prisma.userProfile.create({
      data: {
        id, // must match Supabase Auth user ID
        username,
      },
    });

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
