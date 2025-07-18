import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { getUserIdFromSupabase } from "@utils/auth";
import logger from "@utils/logger"

const prisma = new PrismaClient();

// Get feed posts (posts from all users, with option to filter)
export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    
    // Optional filters
    const limit = url.searchParams.get('limit') ? 
      parseInt(url.searchParams.get('limit')!) : 20;
    const page = url.searchParams.get('page') ? 
      parseInt(url.searchParams.get('page')!) : 1;
    const plantTypeId = url.searchParams.get('plantTypeId') ?
      parseInt(url.searchParams.get('plantTypeId')!) : undefined;
    
    // In a real app with following functionality, you'd filter by followed users
    // For now, show everyone's posts (excluding deleted ones)
    const where: Prisma.PostWhereInput = {
      deleted_at: null
    };
    
    if (plantTypeId) {
      where.PLANT = {
        plant_type_id: plantTypeId
      };
    }
    
    const posts = await prisma.post.findMany({
      where,
      include: {
        USER: {
          select: {
            id: true,
            username: true,
          }
        },
        PLANT: {
          include: {
            PLANT_TYPE: true
          }
        },
        LIKES: {
          where: {
            deleted_at: null
          },
          select: {
            user_id: true
          }
        },
        _count: {
          select: {
            COMMENT: {
              where: {
                deleted_at: null
              }
            },
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
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Add a flag for posts the current user has liked
    const enrichedPosts = posts.map(post => ({
      ...post,
      isLiked: post.LIKES.some(like => like.user_id === userId)
    }));

    return NextResponse.json(enrichedPosts, { status: 200 });
  } catch (error: unknown) {
    logger.error(error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}