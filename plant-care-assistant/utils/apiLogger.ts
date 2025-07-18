import { NextRequest } from "next/server";
import logger from "@utils/logger"
import { getUserIdFromSupabase } from "./auth";

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

export async function logRequest(context: RequestContext, request: NextRequest){
    try {
        const userId = await getUserIdFromSupabase(request);
        context.userId = userId === null ? undefined : userId

            logger.info('API Request', {
      requestId: context.requestId,
      userId,
      endpoint: context.endpoint,
      method: context.method,
      userAgent: context.userAgent,
    });
    } catch (error) {
        logger.warn('Could not extract user context', {
            requestId: context.requestId,
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}
