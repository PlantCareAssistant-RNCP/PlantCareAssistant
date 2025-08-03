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
      logger.error("Post image validation failed:", validationResult.error);
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'post-images');

    const response = await fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error("Post upload failed:", error);
      return null;
    }

    const { url } = await response.json();
    logger.info("Post image uploaded successfully", { 
      fileSize: file.size,
      fileType: file.type,
      bucket: 'post-images'
    });
    return url;
  } catch (error) {
    logger.error("Error in uploadPostImage:", error);
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
      logger.error("Plant image validation failed:", validationResult.error);
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'plant-images');

    const response = await fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error("Plant upload failed:", error);
      return null;
    }

    const { url } = await response.json();
    logger.info("Plant image uploaded successfully", { 
      fileSize: file.size,
      fileType: file.type,
      bucket: 'plant-images'
    });
    return url;
  } catch (error) {
    logger.error("Error in uploadPlantImage:", error);
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
    if (!url || !url.includes('/post-images/')) {
      logger.warn("Invalid post image URL for deletion", { url });
      return false;
    }

    const response = await fetch('/api/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ 
        url: url,
        bucket: 'post-images'
      }),
    });

    if (response.ok) {
      logger.info("Post image deleted successfully", { url });
      return true;
    } else {
      const error = await response.json();
      logger.error("Post image delete failed:", error);
      return false;
    }
  } catch (error) {
    logger.error("Error in deletePostImage:", error);
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
    if (!url || !url.includes('/plant-images/')) {
      logger.warn("Invalid plant image URL for deletion", { url });
      return false;
    }

    const response = await fetch('/api/upload', { // Use unified endpoint
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ 
        url: url,
        bucket: 'plant-images'
      }),
    });

    if (response.ok) {
      logger.info("Plant image deleted successfully", { url });
      return true;
    } else {
      const error = await response.json();
      logger.error("Plant image delete failed:", error);
      return false;
    }
  } catch (error) {
    logger.error("Error in deletePlantImage:", error);
    return false;
  }
}