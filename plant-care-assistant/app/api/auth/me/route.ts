import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import {
  createRequestContext,
  logRequest,
  logResponse,
  logError,
} from "@utils/apiLogger";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const context = createRequestContext(request, "/api/auth/me");

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Get Supabase user details
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the token from the header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1] || "";

    // Get user details from Supabase
    const {
      data: { user: supabaseUser },
      error: supabaseError,
    } = await supabase.auth.getUser(token);

    if (supabaseError || !supabaseUser) {
      logResponse(context, 401, {
        supabaseError: supabaseError?.message || "Unknown Supabase error",
        hasToken: !!token,
      });
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Get user from database
    const dbUser = await prisma.userProfile.findUnique({
      where: { id: context.userId },
      select: {
        id: true,
        username: true,
        created_at: true,
      },
    });

    // Return combined user information
    const userData = {
      user: {
        ...dbUser,
        email: supabaseUser.email,
        supabaseUserId: supabaseUser.id,
      },
    };

    logResponse(context, 200, {
      hasDbProfile: !!dbUser,
      hasUsername: !!dbUser?.username,
      userEmail: supabaseUser.email,
    });

    return NextResponse.json(userData);
  } catch (error) {
    logError(context, error as Error, {
      operation: "fetch_user_profile",
    });
    return NextResponse.json(
      { error: "Failed to fetch user information" },
      { status: 500 }
    );
  }
}
