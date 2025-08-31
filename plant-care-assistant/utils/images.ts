import { createClient } from "@supabase/supabase-js";
import { validateImage, isValidationError } from "./validation";
import logger from "@utils/logger";

// Create a single Supabase client for interacting with your database (public operations)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadPostImage(file: File): Promise<string | null> {
  try {
    // Validate image before upload (following your validation patterns)
    const validationResult = validateImage(file);
    if (isValidationError(validationResult)) {
      logger.error({
        message: "Post image validation failed:",
        error: validationResult.error,
      });
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "post-images");

    // Use absolute URL if running on the server
    const apiUrl = process.env.NEXT_PUBLIC_SITE_URL // e.g. "http://localhost:3000"
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/upload`
      : "http://localhost:3000/api/upload"; // fallback for dev

    const response = await fetch(apiUrl, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error({
        message: "Post upload failed:",
        error: error,
      });
      return null;
    }

    const { url } = await response.json();
    if (process.env.NODE_ENV === "development") {
      logger.info({
        fileSize: file.size,
        fileType: file.type,
        bucket: "post-images",
        message: "Post image uploaded successfully",
      });
    }
    return url;
  } catch (error) {
    // Print everything about the error
    console.error("Error in uploadPostImage:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    } else {
      // Print the error as JSON if possible
      try {
        console.error("Error details (JSON):", JSON.stringify(error));
      } catch {
        console.error("Error details (raw):", error);
      }
    }
    return null;
  }
}

/**
 * Upload a plant image via API endpoint
 * @param file The file to upload
 * @returns URL of the uploaded file or null if upload failed
 */
export async function uploadPlantImage(file: File): Promise<string | null> {
  try {
    // Validate image before upload (following your validation patterns)
    const validationResult = validateImage(file);
    if (isValidationError(validationResult)) {
      logger.error({
        message: "Plant image validation failed:",
        error: validationResult.error,
      });
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "plant-images");

    const response = await fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error({
        message: "Plant upload failed:",
        error: error,
      });
      return null;
    }

    const { url } = await response.json();
    logger.info({
      fileSize: file.size,
      fileType: file.type,
      bucket: "plant-images",
      message: "Plant image uploaded successfully",
    });
    return url;
  } catch (error) {
    logger.error({
      message: "Error in uploadPlantImage:",
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Delete a post image via API endpoint
 * @param url The URL of the image to delete
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function deletePostImage(url: string): Promise<boolean> {
  try {
    if (!url || !url.includes("/post-images/")) {
      logger.warn({
        url,
        message: "Invalid post image URL for deletion",
      });
      return false;
    }

    const response = await fetch("/api/upload", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        url: url,
        bucket: "post-images",
      }),
    });

    if (response.ok) {
      logger.info({
        url,
        message: "Post image deleted successfully",
      });
      return true;
    } else {
      const error = await response.json();
      logger.error({
        message: "Post image delete failed:",
        error: error,
      });
      return false;
    }
  } catch (error) {
    logger.error({
      message: "Error in deletePostImage:",
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Delete a plant image via API endpoint
 * @param url The URL of the image to delete
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function deletePlantImage(url: string): Promise<boolean> {
  try {
    if (!url || !url.includes("/plant-images/")) {
      logger.warn({
        url,
        message: "Invalid plant image URL for deletion",
      });
      return false;
    }

    const response = await fetch("/api/upload", {
      // Use unified endpoint
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        url: url,
        bucket: "plant-images",
      }),
    });

    if (response.ok) {
      logger.info({
        url,
        message: "Plant image deleted successfully",
      });
      return true;
    } else {
      const error = await response.json();
      logger.error({
        message: "Plant image delete failed:",
        error: error,
      });
      return false;
    }
  } catch (error) {
    logger.error({
      message: "Error in deletePlantImage:",
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
