import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId, isAuthenticated } from "@utils/auth";

const prisma = new PrismaClient();

// Get a single comment
export async function GET(
  req: Request,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const commentId = parseInt(params.commentId);

    const comment = await prisma.comment.findFirst({
      where: {
        comment_id: commentId,
        deleted_at: null
      },
      include: {
        USER: {
          select: {
            user_id: true,
            username: true
          }
        }
      }
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json(comment, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch comment" },
      { status: 500 }
    );
  }
}

// Update a comment
export async function PUT(
  req: Request,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getCurrentUserId(req);
    const commentId = parseInt(params.commentId);
    const body = await req.json();

    // Validate required fields
    if (!body.content) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Check if comment exists and belongs to user
    const existingComment = await prisma.comment.findFirst({
      where: {
        comment_id: commentId,
        user_id: userId,
        deleted_at: null
      }
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: "Comment not found or you don't have permission to edit it" },
        { status: 404 }
      );
    }

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { comment_id: commentId },
      data: {
        content: body.content,
        photo: body.photo,
        updated_at: new Date()
      }
    });

    return NextResponse.json(updatedComment, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

// Delete a comment (soft delete)
export async function DELETE(
  req: Request,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = getCurrentUserId(req);
    const commentId = parseInt(params.commentId);

    // Check if comment exists and belongs to user
    const existingComment = await prisma.comment.findFirst({
      where: {
        comment_id: commentId,
        user_id: userId,
        deleted_at: null
      }
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: "Comment not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    // Soft delete the comment
    await prisma.comment.update({
      where: { comment_id: commentId },
      data: { deleted_at: new Date() }
    });

    return NextResponse.json(
      { message: "Comment deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}