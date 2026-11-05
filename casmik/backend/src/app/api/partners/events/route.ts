import { NextResponse } from 'next/server';
import { partnerSubscribers } from '@/lib/partnerEvents';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const partnerId = searchParams.get('partnerId');

  if (!partnerId) {
    return NextResponse.json({ error: 'partnerId is required' }, { status: 400 });
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

      if (!partnerSubscribers.has(partnerId)) {
        partnerSubscribers.set(partnerId, new Set());
      }
      partnerSubscribers.get(partnerId)!.add(sendData);

      // Send initial ACK
      controller.enqueue(
        new TextEncoder().encode(
          `data: ${JSON.stringify({ type: 'connected', partnerId, timestamp: new Date().toISOString() })}\n\n`
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
        if (sendData && partnerSubscribers.has(partnerId)) {
          partnerSubscribers.get(partnerId)!.delete(sendData);
        }
      });
    },
    cancel() {
      if (sendData && partnerSubscribers.has(partnerId)) {
        partnerSubscribers.get(partnerId)!.delete(sendData);
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
