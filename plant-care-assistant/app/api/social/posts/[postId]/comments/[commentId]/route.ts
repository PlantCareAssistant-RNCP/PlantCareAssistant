import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserIdFromSupabase } from "@utils/auth";
import { 
  validateId, 
  validateComment, 
  isValidationError, 
  validationErrorResponse 
} from "@utils/validation";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
    props: { params: Promise<{ postId: string; commentId: string }> } 
) {
  try {
    const params = await props.params
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const commentIdResult = validateId(params.commentId);
    if (isValidationError(commentIdResult)) {
      return validationErrorResponse(commentIdResult);
    }
    const commentId = commentIdResult;

    const comment = await prisma.comment.findFirst({
      where: {
        comment_id: commentId,
        deleted_at: null
      },
      include: {
        USER: {
          select: {
            id: true,
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

export async function PUT(
  request: Request,
    props: { params: Promise<{ postId: string; commentId: string }> } 
) {
  try {
    const params = await props.params
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const commentIdResult = validateId(params.commentId);
    if (isValidationError(commentIdResult)) {
      return validationErrorResponse(commentIdResult);
    }
    const commentId = commentIdResult;
    
    const body = await request.json();

    const validationResult = validateComment(body);
    if (isValidationError(validationResult)) {
      return validationErrorResponse(validationResult);
    }
    
    const validComment = validationResult;

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

    const updatedComment = await prisma.comment.update({
      where: { comment_id: commentId },
      data: {
        content: validComment.content,
        photo: validComment.photo,
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

export async function DELETE(
  request: Request,
    props: { params: Promise<{ postId: string; commentId: string }> } 
) {
  try {
    const params = await props.params
    const userId = await getUserIdFromSupabase(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const commentIdResult = validateId(params.commentId);
    if (isValidationError(commentIdResult)) {
      return validationErrorResponse(commentIdResult);
    }
    const commentId = commentIdResult;

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