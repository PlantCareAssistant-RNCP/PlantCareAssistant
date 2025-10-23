import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import logger from "@utils/logger";

// Types for validation
export type ValidationError = {
  error: string;
  status: number;
};

// Base record type for handling unknown input
export interface BaseRecord {
  [key: string]: unknown;
}

// Input interfaces - what might come from requests
export interface EventInput extends BaseRecord {
  title?: unknown;
  start?: unknown;
  end?: unknown;
  plantId?: unknown;
  repeatWeekly?: unknown;
  repeatMonthly?: unknown;
}

export interface PlantInput extends BaseRecord {
  plant_name?: unknown;
  plant_type_id?: unknown;
  photo?: unknown;
}

export interface UserInput extends BaseRecord {
  username?: unknown;
  email?: unknown;
  password?: unknown;
}

export interface PostInput extends BaseRecord {
  title?: unknown;
  content?: unknown;
  plant_id?: unknown;
}

export interface CommentInput extends BaseRecord {
  content?: unknown;
}

export interface ValidEvent {
  title: string;
  start: Date;
  end: Date;
  plantId?: number;
  repeatWeekly?: boolean;
  repeatMonthly?: boolean;
}

export interface ValidPlant {
  plant_name: string;
  plant_type_id: number;
  photo?: string;
}

export interface ValidUser {
  username: string;
  email: string;
  password: string;
}

export interface ValidPost {
  title: string;
  content: string;
  plant_id: number;
  photo?: string;
}

export interface ValidComment {
  content: string;
  photo?: string;
}

// Type guard for checking if a value exists
function exists<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

// Generic required fields validator
export function validateRequiredFields(
  body: BaseRecord,
  fields: string[]
): ValidationError | null {
  const missingFields = fields.filter((field) => !exists(body[field]));

  if (missingFields.length > 0) {
    return {
      error: `Missing required fields: ${missingFields.join(", ")}`,
      status: 400,
    };
  }

  return null;
}

// Email format validator
export function validateEmail(email: unknown): ValidationError | null {
  if (typeof email !== "string") {
    return {
      error: "Email must be a string",
      status: 400,
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      error: "Invalid email format",
      status: 400,
    };
  }
  return null;
}

// Date range validator
export function validateDateRange(
  start: Date,
  end: Date
): ValidationError | null {
  try {
    const startDateTime = DateTime.fromJSDate(start);
    const endDateTime = DateTime.fromJSDate(end);
    const nowDateTime = DateTime.now();

    if (!startDateTime.isValid || !endDateTime.isValid) {
      return {
        error: "Invalid date format",
        status: 400,
      };
    }

    if (startDateTime > endDateTime) {
      return {
        error: "Start time must be earlier than end time",
        status: 400,
      };
    }

    const startDay = startDateTime.startOf("day");
    const todayDay = nowDateTime.startOf("day");

    if (startDay < todayDay) {
      return { error: "Start time cannot be before today", status: 400 };
    }

    return null;
  } catch (error) {
    logger.error({
      message: "Date range validation error:",
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      error: "Invalid date format",
      status: 400,
    };
  }
}

//ID validator
export function validateId(id: string | number): number | ValidationError {
  let numId: number;

  if (typeof id === "number") {
    numId = id;
  } else {
    numId = parseInt(id);
  }

  if (isNaN(numId) || numId <= 0) {
    return {
      error: "Invalid ID format",
      status: 400,
    };
  }

  return numId;
}

// Event validator that returns either error or valid event
export function validateEvent(body: EventInput): ValidationError | ValidEvent {
  const requiredError = validateRequiredFields(body, ["title", "start", "end"]);
  if (requiredError) return requiredError;

  if (typeof body.title !== "string") {
    return { error: "Title must be a string", status: 400 };
  }

  try {
    const startDate = new Date(String(body.start));
    const endDate = new Date(String(body.end));

    const dateError = validateDateRange(startDate, endDate);
    if (dateError) return dateError;

    if (typeof body.repeatWeekly !== "undefined") {
      if (typeof body.repeatWeekly !== "boolean") {
        return {
          error: "repeatWeekly must be a boolean",
          status: 400,
        };
      }
    }

    if (typeof body.repeatMonthly !== "undefined") {
      if (typeof body.repeatMonthly !== "boolean") {
        return {
          error: "repeatMonthly must be a boolean",
          status: 400,
        };
      }
    }

    if (body.repeatWeekly === true && body.repeatMonthly === true) {
      return {
        error: "Event cannot repeat both weekly and monthly",
        status: 400,
      };
    }

    return {
      title: body.title,
      start: startDate,
      end: endDate,
      plantId:
        typeof body.plantId === "number"
          ? body.plantId
          : typeof body.plantId === "string"
          ? parseInt(body.plantId)
          : undefined,
      repeatWeekly: body.repeatWeekly,
      repeatMonthly: body.repeatMonthly,
    };
  } catch (error) {
    logger.error({
      message: "Event validation error:",
      error: error instanceof Error ? error.message : String(error),
    });
    logger.error({
      title: body.title,
      start: body.start,
      end: body.end,
      message: "Problematic input:",
    });
    return {
      error: "Invalid date format",
      status: 400,
    };
  }
}

// Plant validator that returns either error or valid plant
export function validatePlant(body: PlantInput): ValidationError | ValidPlant {
  // Check required fields
  const requiredError = validateRequiredFields(body, [
    "plant_name",
    "plant_type_id",
  ]);
  if (requiredError) return requiredError;

  // Type checking
  if (
    typeof body.plant_name !== "string" ||
    body.plant_name.trim().length === 0
  ) {
    return { error: "Plant name must be a non-empty string", status: 400 };
  }

  let plantTypeId: number;

  if (typeof body.plant_type_id === "number") {
    plantTypeId = body.plant_type_id;
  } else if (typeof body.plant_type_id === "string") {
    plantTypeId = parseInt(body.plant_type_id);
    if (isNaN(plantTypeId)) {
      return { error: "Plant type ID must be a number", status: 400 };
    }
  } else {
    return { error: "Plant type ID must be a number", status: 400 };
  }

  // Return validated object
  return {
    plant_name: body.plant_name,
    plant_type_id: plantTypeId,
    photo: typeof body.photo === "string" ? body.photo : undefined,
  };
}

// User validator
export function validateUser(body: UserInput): ValidationError | ValidUser {
  const requiredError = validateRequiredFields(body, [
    "username",
    "email",
    "password",
  ]);
  if (requiredError) return requiredError;

  if (typeof body.username !== "string") {
    return { error: "Username must be a string", status: 400 };
  }

  if (typeof body.email !== "string") {
    return { error: "Email must be a string", status: 400 };
  }

  if (typeof body.password !== "string") {
    return { error: "Password must be a string", status: 400 };
  }

  const emailError = validateEmail(body.email);
  if (emailError) return emailError;

  if (body.username.length < 3) {
    return {
      error: "Username must be at least 3 characters long",
      status: 400,
    };
  }

  if (body.username.length > 30) {
    return {
      error: "Username cannot exceed 30 characters in length",
      status: 400,
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(body.username)) {
    return {
      error: "Username can only contain letters, numbers, and underscores",
      status: 400,
    };
  }

  // Password strength validation
  if (body.password.length < 8) {
    return {
      error: "Password must be at least 8 characters long",
      status: 400,
    };
  }

  const hasUpperCase = /[A-Z]/.test(body.password);
  const hasLowerCase = /[a-z]/.test(body.password);
  const hasNumbers = /\d/.test(body.password);
  // const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(body.password);

  if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
    return {
      error:
        "Password must contain uppercase letters, lowercase letters, and numbers",
      status: 400,
    };
  }

  // You could optionally require special characters too
  // if (!hasSpecialChars) {
  //   return {
  //     error: "Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)",
  //     status: 400
  //   };
  // }

  return {
    username: body.username,
    email: body.email,
    password: body.password,
  };
}

// Post validator
export function validatePost(body: any): ValidationError | ValidPost {
  const requiredError = validateRequiredFields(body, [
    "title",
    "content",
    "plant_id",
  ]);
  if (requiredError) return requiredError;

  // Title length check
  if (typeof body.title !== "string" || body.title.trim().length === 0) {
    return { error: "Title is required", status: 400 };
  }
  if (body.title.length > 100) {
    return { error: "Title must be 100 characters or fewer", status: 400 };
  }

  // Content length check
  if (typeof body.content !== "string" || body.content.trim().length === 0) {
    return { error: "Content is required", status: 400 };
  }
  if (body.content.length > 10000) {
    return { error: "Content must be 10,000 characters or fewer", status: 400 };
  }

  let plantId: number;

  if (typeof body.plant_id === "number") {
    plantId = body.plant_id;
  } else if (typeof body.plant_id === "string") {
    plantId = parseInt(body.plant_id);
    if (isNaN(plantId)) {
      return { error: "Plant ID must be a number", status: 400 };
    }
  } else {
    return { error: "Plant ID must be a number", status: 400 };
  }

  if (body.photo !== undefined) {
    if (body.photo !== null && typeof body.photo !== "string") {
      return { error: "Photo must be a URL string or null", status: 400 };
    }
  }

  return {
    title: body.title,
    content: body.content,
    plant_id: plantId,
    photo: typeof body.photo === "string" ? body.photo : undefined,
  };
}

// Comment validator
export function validateComment(
  body: CommentInput
): ValidationError | ValidComment {
  const requiredError = validateRequiredFields(body, ["content"]);
  if (requiredError) return requiredError;

  if (typeof body.content !== "string") {
    return { error: "Comment content must be a string", status: 400 };
  }
  if (body.content.length > 10000) {
    return { error: "Content must be 10,000 characters or fewer", status: 400 };
  }

  if (body.photo !== undefined) {
    if (body.photo !== null && typeof body.photo !== "string") {
      return { error: "Photo must be a URL string or null", status: 400 };
    }
  }

  return {
    content: body.content,
    photo: typeof body.photo === "string" ? body.photo : undefined,
  };
}

export function validateImage(file: File): ValidationError | File {
  const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (!file) {
    return { error: "No file provided", status: 400 };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      error: "Only JPEG, PNG, WebP and GIF images are allowed",
      status: 400,
    };
  }

  if (file.size > maxSizeInBytes) {
    return {
      error: "File size must be less than 5MB",
      status: 400,
    };
  }

  return file;
}

// Helper to create error response
export function validationErrorResponse(
  validationError: ValidationError
): NextResponse {
  return NextResponse.json(
    { error: validationError.error },
    { status: validationError.status }
  );
}

// Helper to determine if a result is a validation error
export function isValidationError(
  result: ValidationError | unknown
): result is ValidationError {
  return (
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    "status" in result
  );
}

//Partial User Validation for updates where not all fields are required eg. PUT endpoints
export function validatePartialUser(
  body: UserInput
): ValidationError | Partial<ValidUser> {
  const result: Partial<ValidUser> = {};

  // Validate username if provided
  if (body.username !== undefined) {
    if (typeof body.username !== "string") {
      return { error: "Username must be a string", status: 400 };
    }

    if (body.username.length < 3) {
      return {
        error: "Username must be at least 3 characters long",
        status: 400,
      };
    }

    if (body.username.length > 30) {
      return {
        error: "Username cannot exceed 30 characters in length",
        status: 400,
      };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(body.username)) {
      return {
        error: "Username can only contain letters, numbers, and underscores",
        status: 400,
      };
    }

    result.username = body.username;
  }

  // Validate email if provided
  if (body.email !== undefined) {
    const emailError = validateEmail(body.email);
    if (emailError) return emailError;

    result.email = body.email as string;
  }

  // Validate password if provided
  if (body.password !== undefined) {
    if (typeof body.password !== "string") {
      return { error: "Password must be a string", status: 400 };
    }

    if (body.password.length < 8) {
      return {
        error: "Password must be at least 8 characters long",
        status: 400,
      };
    }

    const hasUpperCase = /[A-Z]/.test(body.password);
    const hasLowerCase = /[a-z]/.test(body.password);
    const hasNumbers = /\d/.test(body.password);

    if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
      return {
        error:
          "Password must contain uppercase letters, lowercase letters, and numbers",
        status: 400,
      };
    }

    result.password = body.password;
  }

  // If nothing was provided or validation passed for all provided fields
  return result;
}

//Partial Plant Validation for Updates where not all fields are required
export function validatePartialPlant(
  body: PlantInput
): ValidationError | Partial<ValidPlant> {
  const result: Partial<ValidPlant> = {};

  // Validate plant_name if provided
  if (body.plant_name !== undefined) {
    if (typeof body.plant_name !== "string") {
      return { error: "Plant name must be a string", status: 400 };
    }

    // Add any additional validation rules for plant_name here
    // For example, minimum length, maximum length, etc.
    if (body.plant_name.trim().length === 0) {
      return { error: "Plant name cannot be empty", status: 400 };
    }

    if (body.plant_name.length > 100) {
      return { error: "Plant name cannot exceed 100 characters", status: 400 };
    }

    result.plant_name = body.plant_name;
  }

  // Validate plant_type_id if provided
  if (body.plant_type_id !== undefined) {
    let plantTypeId: number;

    if (typeof body.plant_type_id === "number") {
      plantTypeId = body.plant_type_id;
    } else if (typeof body.plant_type_id === "string") {
      plantTypeId = parseInt(body.plant_type_id);
      if (isNaN(plantTypeId)) {
        return { error: "Plant type ID must be a valid number", status: 400 };
      }
    } else {
      return { error: "Plant type ID must be a number", status: 400 };
    }

    // Add any validation for the plant_type_id value
    if (plantTypeId <= 0) {
      return { error: "Plant type ID must be a positive number", status: 400 };
    }

    result.plant_type_id = plantTypeId;
  }

  // Validate photo if provided
  if (body.photo !== undefined) {
    // Allow null to remove a photo
    if (body.photo !== null && typeof body.photo !== "string") {
      return { error: "Photo must be a URL string or null", status: 400 };
    }

    // If photo is a string, validate it as a URL
    if (typeof body.photo === "string") {
      // Optional: Add URL validation if needed
      // const urlRegex = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i;
      // if (!urlRegex.test(body.photo)) {
      //   return { error: "Invalid photo URL format", status: 400 };
      // }

      result.photo = body.photo;
    } else {
      // If null was provided, we set photo to undefined which will remove it
      result.photo = undefined;
    }
  }

  // If nothing was provided or validation passed for all provided fields
  return result;
}

//Partial Post Validation for Updates where not all fields are required
export function validatePartialPost(
  body: PostInput
): ValidationError | Partial<ValidPost> {
  const result: Partial<ValidPost> = {};

  // Validate title if provided
  if (body.title !== undefined) {
    if (typeof body.title !== "string") {
      return { error: "Title must be a string", status: 400 };
    }
    if (body.title.length > 100) {
      return { error: "Title must be 100 characters or fewer", status: 400 };
    }
    result.title = body.title;
  }

  // Validate content if provided
  if (body.content !== undefined) {
    if (typeof body.content !== "string") {
      return { error: "Content must be a string", status: 400 };
    }
    if (body.content.length > 10000) {
      return { error: "Content must be 10,000 characters or fewer", status: 400 };
    }
    result.content = body.content;
  }

  // Validate photo if provided
  if (body.photo !== undefined) {
    if (body.photo !== null && typeof body.photo !== "string") {
      return { error: "Photo must be a URL string or null", status: 400 };
    }
    result.photo = typeof body.photo === "string" ? body.photo : undefined;
  }

  return result;
}

//Partial Event Validation for Updates where not all fields are required
export function validatePartialEvent(
  body: EventInput
): ValidationError | Partial<ValidEvent> {
  const result: Partial<ValidEvent> = {};

  // Validate title if provided
  if (body.title !== undefined) {
    if (typeof body.title !== "string") {
      return { error: "Title must be a string", status: 400 };
    }

    if (body.title.trim().length === 0) {
      return { error: "Title cannot be empty", status: 400 };
    }

    result.title = body.title;
  }

  // Validate start if provided
  if (body.start !== undefined) {
    try {
      const startDate = new Date(String(body.start));
      if (isNaN(startDate.getTime())) {
        return { error: "Invalid start date format", status: 400 };
      }
      result.start = startDate;
    } catch (error) {
      logger.error({
        message: "Start date validation error:",
        error: error instanceof Error ? error.message : String(error),
      });
      return { error: "Invalid start date format", status: 400 };
    }
  }

  // Validate end if provided
  if (body.end !== undefined) {
    try {
      const endDate = new Date(String(body.end));
      if (isNaN(endDate.getTime())) {
        return { error: "Invalid end date format", status: 400 };
      }
      result.end = endDate;
    } catch (error) {
      logger.error({
        message: "End date validation error:",
        error: error instanceof Error ? error.message : String(error),
      });
      return { error: "Invalid end date format", status: 400 };
    }
  }

  // Validate date range if both start and end are provided
  if (result.start && result.end) {
    const dateError = validateDateRange(result.start, result.end);
    if (dateError) return dateError;
  }

  // Validate plantId if provided
  if (body.plantId !== undefined) {
    if (body.plantId === null) {
      result.plantId = undefined;
    } else {
      let plantId: number;

      if (typeof body.plantId === "number") {
        plantId = body.plantId;
      } else if (typeof body.plantId === "string") {
        plantId = parseInt(body.plantId);
        if (isNaN(plantId)) {
          return { error: "Plant ID must be a valid number", status: 400 };
        }
      } else {
        return { error: "Plant ID must be a number", status: 400 };
      }

      if (plantId <= 0) {
        return { error: "Plant ID must be a positive number", status: 400 };
      }

      result.plantId = plantId;
    }
  }

  // Validate repeatWeekly if provided
  if (body.repeatWeekly !== undefined) {
    if (typeof body.repeatWeekly !== "boolean") {
      return {
        error: "repeatWeekly must be a boolean",
        status: 400,
      };
    }
    result.repeatWeekly = body.repeatWeekly;
  }

  // Validate repeatMonthly if provided
  if (body.repeatMonthly !== undefined) {
    if (typeof body.repeatMonthly !== "boolean") {
      return {
        error: "repeatMonthly must be a boolean",
        status: 400,
      };
    }
    result.repeatMonthly = body.repeatMonthly;
  }

  // Check mutual exclusivity
  if (result.repeatWeekly === true && result.repeatMonthly === true) {
    return {
      error: "Event cannot repeat both weekly and monthly",
      status: 400,
    };
  }

  return result;
}
