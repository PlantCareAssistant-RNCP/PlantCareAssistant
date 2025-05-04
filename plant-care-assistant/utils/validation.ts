import { NextResponse } from "next/server";

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

// Validated output interfaces - what we expect after validation
export interface ValidEvent {
  title: string;
  start: Date;
  end: Date;
  plantId?: number; // Only truly optional fields remain optional
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
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        error: "Invalid date format",
        status: 400,
      };
    }
    if (start >= end) {
      return {
        error: "Start time must be earlier than end time",
        status: 400,
      };
    }
    return null;
  } catch (error) {
    console.error("Date range validation error:", error);
    return {
      error: "Invalid date format",
      status: 400,
    };
  }
}

// Event validator that returns either error or valid event
export function validateEvent(body: EventInput): ValidationError | ValidEvent {
  // Check required fields
  const requiredError = validateRequiredFields(body, ["title", "start", "end"]);
  if (requiredError) return requiredError;

  // Type checking
  if (typeof body.title !== "string") {
    return { error: "Title must be a string", status: 400 };
  }

  // Parse dates for validation
  try {
    const startDate = new Date(String(body.start));
    const endDate = new Date(String(body.end));

    const dateError = validateDateRange(startDate, endDate);
    if (dateError) return dateError;

    // If all validation passes, return a properly typed object
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
    };
  } catch (error) {
    console.error("Event validation error:", error);
    console.error("Problematic input:", {
      title: body.title,
      start: body.start,
      end: body.end,
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
  if (typeof body.plant_name !== "string") {
    return { error: "Plant name must be a string", status: 400 };
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
export function validatePost(body: PostInput): ValidationError | ValidPost {
  const requiredError = validateRequiredFields(body, [
    "title",
    "content",
    "plant_id",
  ]);
  if (requiredError) return requiredError;

  // Type validation and conversion
  if (typeof body.title !== "string") {
    return { error: "Title must be a string", status: 400 };
  }

  if (typeof body.content !== "string") {
    return { error: "Content must be a string", status: 400 };
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

  return {
    content: body.content,
    photo: typeof body.photo === "string" ? body.photo : undefined,
  };
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
