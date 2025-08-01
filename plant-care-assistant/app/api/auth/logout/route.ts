import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  createRequestContext,
  logRequest,
  logResponse,
  logError,
} from "@utils/apiLogger";

export async function POST(request: NextRequest) {
  const context = createRequestContext(request, "/api/auth/logout");

  try {
    await logRequest(context, request);

    const supabase = createServerActionClient({ cookies });
    await supabase.auth.signOut();

    logResponse(context, 200, {
      logoutSuccess: true,
      hadUserId: !!context.userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(context, error as Error, {
      operation: "user_logout",
    });
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
