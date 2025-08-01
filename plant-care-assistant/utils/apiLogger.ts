import { NextRequest } from "next/server";
import logger from "@utils/logger";
import { getUserIdFromSupabase } from "./auth";

type logRecord = Record<string, string | number | boolean | null | undefined>;

export interface RequestContext {
  requestId: string;
  userId?: string;
  endpoint: string;
  method: string;
  startTime: number;
  userAgent?: string;
}

export function createRequestContext(
  request: Request,
  endpoint: string
): RequestContext {
  return {
    requestId: crypto.randomUUID(),
    endpoint,
    method: request.method,
    startTime: Date.now(),
    userAgent: request.headers.get("user-agent") || undefined,
  };
}

export async function logRequest(
  context: RequestContext,
  request: NextRequest
) {
  try {
    const userId = await getUserIdFromSupabase(request);
    context.userId = userId === null ? undefined : userId;

    logger.info("API Request", {
      requestId: context.requestId,
      userId,
      endpoint: context.endpoint,
      method: context.method,
      userAgent: context.userAgent,
    });
  } catch (error) {
    logger.warn("Could not extract user context", {
      requestId: context.requestId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export function logResponse(
  context: RequestContext,
  status: number,
  additionalData?: logRecord
) {
  const duration = Date.now() - context.startTime;

  logger.info("API Response", {
    requestId: context.requestId,
    userId: context.userId,
    endpoint: context.endpoint,
    method: context.method,
    status,
    duration: `${duration}ms`,
    ...additionalData,
  });
}

export function logError(
  context: RequestContext,
  error: Error,
  additionalData?: logRecord
) {
  const duration = Date.now() - context.startTime;

  logger.error("API Error", {
    requestId: context.requestId,
    userId: context.userId,
    endpoint: context.endpoint,
    method: context.method,
    error: error.message,
    stack: error.stack,
    duration: `${duration}ms`,
    ...additionalData,
  });
}
