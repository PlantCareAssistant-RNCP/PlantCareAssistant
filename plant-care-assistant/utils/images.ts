import { createClient } from "@supabase/supabase-js";
import { validateImage, isValidationError } from "./validation";
import logger from "@utils/logger";

// Create a single Supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload an image to Supabase Storage
 * @param file The file to upload
 * @param userId The user ID (used in the file path)
 * @returns URL of the uploaded file or null if upload failed
 */
export async function uploadPostImage(
  file: File,
  userId: string
): Promise<string | null> {
  try {
    const validationResult = validateImage(file);
    if (isValidationError(validationResult)) {
      logger.error("Image validation failed:", validationResult.error);
      return null;
    }
    // Create a unique file name
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload the file
    const { data, error } = await supabase.storage
      .from("post-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      logger.error("Error uploading file:", error);
      return null;
    }

    // Get the public URL for the file
    const {
      data: { publicUrl },
    } = supabase.storage.from("post-images").getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    logger.error("Error in uploadPostImage:", error);
    return null;
  }
}

export async function deletePostImage(url: string): Promise<boolean> {
  try {
    // Extract the path from the URL (userId/filename)
    const urlPath = new URL(url).pathname;
    const filePath = urlPath.split("/").slice(-2).join("/");

    const { error } = await supabase.storage
      .from("post-images")
      .remove([filePath]);

    if (error) {
      logger.error("Error deleting file:", error);
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Error in deletePostImage:", error);
    return false;
  }
}
