import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserIdFromSupabase } from "@utils/auth";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    console.log("Auth/me endpoint called");
    
    // Get the user ID using our auth function
    const userId = await getUserIdFromSupabase(request);
    console.log("User ID from auth function:", userId);
    
    if (!userId) {
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
    const { data: { user: supabaseUser }, error: supabaseError } = 
      await supabase.auth.getUser(token);
      
    if (supabaseError || !supabaseUser) {
      console.error("Error getting Supabase user:", supabaseError);
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Get user from database
    const dbUser = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        created_at: true,
        // Add other fields you want to include
      }
    });

    // Return combined user information
    return NextResponse.json({
      user: {
        ...dbUser,
        email: supabaseUser.email,
        supabaseUserId: supabaseUser.id,
        // Include other fields from Supabase if needed
      }
    });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json(
      { error: "Failed to fetch user information" },
      { status: 500 }
    );
  }
}