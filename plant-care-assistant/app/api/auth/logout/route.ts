import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@lib/supabaseServer";
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

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      logError(context, error, {
        operation: "user_logout",
        errorType: "supabase_signout_error",
      });
      return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
    }

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
