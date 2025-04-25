import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId, isAuthenticated } from "@utils/auth";

const prisma = new PrismaClient();

// Get all comments for a specific post
export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postId = parseInt(params.postId);

    // Check if post exists
    const post = await prisma.post.findFirst({
      where: {
        post_id: postId,
        deleted_at: null
      }
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get comments for the post
    const comments = await prisma.comment.findMany({
      where: {
        post_id: postId,
        deleted_at: null
      },
      include: {
        USER: {
          select: {
            user_id: true,
            username: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(comments, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// Create a new comment on a post
export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getCurrentUserId(req);
    const postId = parseInt(params.postId);
    const body = await req.json();

    // Validate required fields
    if (!body.content) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await prisma.post.findFirst({
      where: {
        post_id: postId,
        deleted_at: null
      }
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Create the comment
    const newComment = await prisma.comment.create({
      data: {
        content: body.content,
        user_id: userId,
        post_id: postId,
        photo: body.photo || null,
        created_at: new Date(),
        updated_at: null,
        deleted_at: null
      }
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}