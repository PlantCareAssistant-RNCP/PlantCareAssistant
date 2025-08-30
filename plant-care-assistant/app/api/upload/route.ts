import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  validateImage,
  isValidationError,
  validationErrorResponse,
} from "@utils/validation";
import {
  createRequestContext,
  logRequest,
  logResponse,
  logError,
} from "@utils/apiLogger";

// Service role client for uploads (bypasses RLS securely)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

export async function POST(request: NextRequest) {
  const context = createRequestContext(request, "/api/upload");

  try {
    await logRequest(context, request);

    // Use your existing auth pattern
    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;

    if (!file || !bucket) {
      logResponse(context, 400, {
        missingFile: !file,
        missingBucket: !bucket,
        errorType: "missing_parameters",
      });
      return NextResponse.json(
        { error: "Missing file or bucket" },
        { status: 400 }
      );
    }

    // Validate bucket type (following your validation patterns)
    if (!["post-images", "plant-images"].includes(bucket)) {
      logResponse(context, 400, {
        invalidBucket: bucket,
        errorType: "invalid_bucket",
      });
      return NextResponse.json(
        { error: "Invalid bucket type" },
        { status: 400 }
      );
    }

    // Validate image (following your validation patterns)
    const validationResult = validateImage(file);
    if (isValidationError(validationResult)) {
      logResponse(context, 400, {
        validationError: validationResult.error,
        errorType: "image_validation",
      });
      return validationErrorResponse(validationResult);
    }

    // Upload with service role (bypasses RLS securely)
    const fileExt = file.name.split(".").pop();
    const fileName = `${context.userId}-${Date.now()}.${fileExt}`;
    const filePath = `${context.userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      logResponse(context, 500, {
        supabaseError: error.message,
        bucket: bucket,
        errorType: "upload_failed",
      });
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);

    logResponse(context, 200, {
      uploadedFile: fileName,
      bucket: bucket,
      fileSize: file.size,
      fileType: file.type,
    });

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    logError(context, error as Error, {
      operation: "upload_image",
    });
    console.error("UPLOAD API ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const context = createRequestContext(request, "/api/upload");

  try {
    await logRequest(context, request);

    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, bucket } = body;

    if (!url || !bucket) {
      logResponse(context, 400);
      return NextResponse.json(
        { error: "Missing URL or bucket" },
        { status: 400 }
      );
    }

    // Validate bucket type
    if (!["post-images", "plant-images"].includes(bucket)) {
      logResponse(context, 400);
      return NextResponse.json(
        { error: "Invalid bucket type" },
        { status: 400 }
      );
    }

    // Extract file path from URL
    const urlPath = new URL(url).pathname;
    const filePath = urlPath.split("/").slice(-2).join("/");

    // Verify the file belongs to the user
    if (!filePath.startsWith(`${context.userId}/`)) {
      logResponse(context, 403);
      return NextResponse.json(
        { error: "Unauthorized to delete this file" },
        { status: 403 }
      );
    }

    // Delete with service role
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      logResponse(context, 500);
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    logResponse(context, 200);
    return NextResponse.json({ success: true });
  } catch (error) {
    logError(context, error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
