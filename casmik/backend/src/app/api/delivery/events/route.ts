import { NextResponse } from 'next/server';
import { deliverySubscribers } from '@/lib/deliveryEvents';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deliveryAgentId = searchParams.get('deliveryAgentId');

  if (!deliveryAgentId) {
    return NextResponse.json({ error: 'deliveryAgentId is required' }, { status: 400 });
  }

  let sendData: ((data: string) => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      sendData = (data: string) => {
        try {
          controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
        } catch {
          // ignore if closed
        }
      };

      if (!deliverySubscribers.has(deliveryAgentId)) {
        deliverySubscribers.set(deliveryAgentId, new Set());
      }
      deliverySubscribers.get(deliveryAgentId)!.add(sendData);

      // Send initial ACK
      controller.enqueue(
        new TextEncoder().encode(
          `data: ${JSON.stringify({ type: 'connected', deliveryAgentId, timestamp: new Date().toISOString() })}\n\n`
        )
      );

      // Keepalive ping every 25 seconds
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': ping\n\n'));
        } catch {
          clearInterval(pingInterval);
        }
      }, 25000);

      request.signal.addEventListener('abort', () => {
        clearInterval(pingInterval);
        if (sendData && deliverySubscribers.has(deliveryAgentId)) {
          deliverySubscribers.get(deliveryAgentId)!.delete(sendData);
        }
      });
    },
    cancel() {
      if (sendData && deliverySubscribers.has(deliveryAgentId)) {
        deliverySubscribers.get(deliveryAgentId)!.delete(sendData);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
