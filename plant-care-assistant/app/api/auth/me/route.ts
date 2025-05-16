import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId, isAuthenticated } from "@utils/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

        const userId = getCurrentUserId(request);

        const user = await prisma.user.findFirst({
            where: { 
                user_id: userId,
                deleted_at: null 
            },
            select: {
                user_id: true,
                username: true,
                email: true,
                created_at: true,
                updated_at: true
                // Don't include password_hash
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch user information" },
            { status: 500 }
        );
    }
}