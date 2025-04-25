import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { getCurrentUserId, isAuthenticated } from "@utils/auth";

const prisma = new PrismaClient();

// List posts (with optional filtering)
export async function GET(req: Request) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId') ? 
      parseInt(url.searchParams.get('userId')!) : undefined;
    const plantId = url.searchParams.get('plantId') ? 
      parseInt(url.searchParams.get('plantId')!) : undefined;

    // Build where clause for filtering
    const where: Prisma.PostWhereInput = {
      deleted_at: null
    };
    
    if (userId) {
      where.user_id = userId;
    }
    
    if (plantId) {
      where.plant_id = plantId;
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        USER: {
          select: {
            user_id: true,
            username: true
          }
        },
        PLANT: true,
        _count: {
          select: {
            COMMENT: true,
            LIKES: {
              where: {
                deleted_at: null
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(posts, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// Create a new post
export async function POST(req: Request) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getCurrentUserId(req);
    const body = await req.json();

    // Validate required fields
    if (!body.title || !body.content || !body.plant_id) {
      return NextResponse.json(
        { error: "Title, content, and plant_id are required" },
        { status: 400 }
      );
    }

    // Verify the plant exists and belongs to the user
    const plant = await prisma.plant.findFirst({
      where: {
        plant_id: body.plant_id,
        user_id: userId,
        deleted_at: null
      }
    });

    if (!plant) {
      return NextResponse.json(
        { error: "Plant not found or doesn't belong to you" },
        { status: 404 }
      );
    }

    // Create the post
    const newPost = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        photo: body.photo,
        user_id: userId,
        plant_id: body.plant_id,
        created_at: new Date(),
        updated_at: null,
        deleted_at: null
      }
    });

    // Also create the USERS_POST relationship
    await prisma.usersPost.create({
      data: {
        user_id: userId,
        post_id: newPost.post_id
      }
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}