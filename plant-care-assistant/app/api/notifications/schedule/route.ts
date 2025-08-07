import { NextRequest, NextResponse } from "next/server";
import { validationErrorResponse } from "@utils/validation";
import { createRequestContext, logRequest, logResponse, logError } from "@utils/apiLogger";

export async function POST(request: NextRequest) {
  const context = createRequestContext(request, '/api/notifications/schedule');
  
  try {
    await logRequest(context, request);
    
    if (!context.userId) {
      logResponse(context, 401);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId, title, message, sendAt } = await request.json();
    const sendTime = new Date(sendAt);
    
    if (sendTime <= new Date()) {
      const validationError = {
        error: "Notification time must be in the future",
        status: 400,
      };
      logResponse(context, 400, { validationError: validationError.error, errorType: "validation" });
      return validationErrorResponse(validationError);
    }

    const onesignalResponse = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        filters: [
          { field: 'external_user_id', value: context.userId }
        ],
        headings: { en: title },
        contents: { en: message },
        send_after: sendTime.toISOString(),
        data: { 
          eventId: eventId.toString(),
          type: 'plant_care_reminder' 
        },
      }),
    });

    const onesignalData = await onesignalResponse.json();
    const notificationId = onesignalData.id;

    if (onesignalResponse.ok) {
      logResponse(context, 200, { eventId, scheduledFor: sendAt, notificationId });
      return NextResponse.json({ message: 'Notification scheduled', notificationId });
    } else {
      throw new Error('OneSignal API failed');
    }

  } catch (error) {
    logError(context, error as Error, { operation: 'schedule_notification' });
    return NextResponse.json({ error: 'Failed to schedule notification' }, { status: 500 });
  }
}