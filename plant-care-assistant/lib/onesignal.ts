import logger from "@utils/logger";
import OneSignal from "react-onesignal";

let isInitialized = false;

export async function initializeOneSignal(userId?: string){
    if(isInitialized) return;

    try{
        await OneSignal.init({
            appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
            allowLocalhostAsSecureOrigin: true, //Dev only
        });

        if(userId){
            await OneSignal.login(userId);
        }

        isInitialized = true;
    } catch(error){
        logger.error('OneSignal initialization failed: ', error);
    }
}

export async function scheduleEventNotification(
    eventId: number,
    title: string,
    message: string,
    sendAt: Date
): Promise<{ notificationId?: string } | undefined> {
    if(sendAt <= new Date()) return;

    try{
        const response = await fetch('/api/notifications/schedule',{
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                eventId,
                title,
                message,
                sendAt: sendAt.toISOString(),
            }),
        });

        if(!response.ok){
            logger.error('Failed to schedule notification');
            return;
        }

        // Parse response and return notificationId
        const data = await response.json();
        return { notificationId: data.notificationId };
    } catch (error){
        logger.error('Error scheduling notification:', error);
        return;
    }
}