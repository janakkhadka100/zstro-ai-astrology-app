// app/api/realtime/stream/route.ts
// SSE endpoint for realtime card updates

import { NextRequest } from "next/server";
import { sub, userChannel } from "@/lib/realtime/bus";
import { isFeatureEnabled } from "@/lib/config/features";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // Check if realtime feature is enabled
    if (!isFeatureEnabled('wsRealtime')) {
      return new Response("Feature disabled", { status: 403 });
    }

    const userId = req.nextUrl.searchParams.get("u");
    if (!userId) {
      return new Response("Bad Request: userId required", { status: 400 });
    }

    console.log(`Starting SSE stream for user: ${userId}`);

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        let isActive = true;
        
        // Create a duplicate Redis connection for this stream
        const redisSub = sub.duplicate();
        
        const send = (data: any) => {
          if (!isActive) return;
          try {
            const message = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(message));
          } catch (error) {
            console.error('Error sending SSE message:', error);
          }
        };

        // Subscribe to user's channel
        redisSub.subscribe(userChannel(userId));
        
        // Handle messages
        redisSub.on("message", (channel, message) => {
          if (!isActive) return;
          try {
            const data = JSON.parse(message);
            send({ 
              type: "cards-patch", 
              patch: data,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            console.error('Error parsing Redis message:', error);
          }
        });

        // Handle subscription confirmation
        redisSub.on("subscribe", (channel) => {
          console.log(`Subscribed to channel: ${channel}`);
          send({ 
            type: "connected", 
            channel,
            timestamp: new Date().toISOString()
          });
        });

        // Handle errors
        redisSub.on("error", (error) => {
          console.error('Redis subscription error:', error);
          if (isActive) {
            send({ 
              type: "error", 
              message: "Connection error",
              timestamp: new Date().toISOString()
            });
          }
        });

        // Keep-alive ping every 25 seconds
        const pingInterval = setInterval(() => {
          if (!isActive) {
            clearInterval(pingInterval);
            return;
          }
          try {
            controller.enqueue(encoder.encode(`: ping\n\n`));
          } catch (error) {
            console.error('Error sending ping:', error);
            clearInterval(pingInterval);
          }
        }, 25000);

        // Send initial connection message
        send({ 
          type: "connected", 
          userId,
          timestamp: new Date().toISOString()
        });

        // Set reconnection hint
        controller.enqueue(encoder.encode("retry: 3000\n\n"));

        // Cleanup function
        (controller as any)._cleanup = async () => {
          isActive = false;
          clearInterval(pingInterval);
          try {
            await redisSub.unsubscribe(userChannel(userId));
            await redisSub.quit();
            console.log(`Cleaned up SSE stream for user: ${userId}`);
          } catch (error) {
            console.error('Error during cleanup:', error);
          }
        };
      },
      cancel() {
        console.log(`SSE stream cancelled for user: ${userId}`);
        (this as any)._cleanup?.();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      }
    });

  } catch (error) {
    console.error('SSE stream error:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
