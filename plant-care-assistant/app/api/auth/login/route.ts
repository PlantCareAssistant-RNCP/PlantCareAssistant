import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  validateRequiredFields,
  validateEmail,
  validationErrorResponse,
} from "@/utils/validation";
// For future implementation: import bcrypt from "bcrypt";
// For future implementation: import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 1. Parse request body
    const body = await req.json();

    const requiredError = validateRequiredFields(body, ["email", "password"]);
    if (requiredError) {
      return validationErrorResponse(requiredError);
    }

    const emailError = validateEmail(body.email);
    if (emailError) {
      return validationErrorResponse(emailError);
    }
    if (typeof body.email !== "string") {
      return NextResponse.json(
        { error: "Email must be a string" },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
        deleted_at: null,
      },
    });

    if (!user) {
      // Security best practice: Don't reveal whether the email exists
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 4. Verify password (placeholder for now)
    // In production, you would use:
    // const passwordValid = await bcrypt.compare(body.password, user.password_hash);
    const passwordValid = body.password === user.password_hash;

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 5. Generate authentication token (placeholder for different auth strategies)
    // Option A: JWT Token approach
    // const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Option B: Session ID approach (would require session storage)
    // const sessionId = crypto.randomUUID();
    // await prisma.session.create({ data: { sessionId, userId: user.user_id, expiresAt: ... } });

    // 6. Return user data and token (using placeholder for now)
    return NextResponse.json(
      {
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
        },
        // For JWT approach: token: token,
        // For session approach: sessionId: sessionId,
        message: "Login successful",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
