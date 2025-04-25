import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
import { getCurrentUserId, isAuthenticated } from "@utils/auth";

// const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const userId = getCurrentUserId(req);

    // For JWT authentication (future implementation):
    // No server-side token invalidation needed since tokens are stateless
    // The client will remove the token from localStorage/cookies
    
    // For session-based authentication (if implemented later):
    // 1. Get authorization header or cookie
    // const authHeader = req.headers.get("Authorization");
    // const sessionToken = authHeader?.split(" ")[1];
    
    // 2. Delete/invalidate the session
    // await prisma.session.update({
    //   where: { token: sessionToken },
    //   data: { valid: false, expiresAt: new Date() }
    // });

    // Log the logout action (optional)
    console.log(`User ${userId} logged out at ${new Date().toISOString()}`);

    return NextResponse.json({ message: "Logout successful" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    );
  }
}