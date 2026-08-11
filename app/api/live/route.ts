import { LIVE } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Listener = ReadableStreamDefaultController<Uint8Array>;

const store = globalThis as unknown as { __truckwalaListeners?: Set<Listener> };
const listeners = (store.__truckwalaListeners ??= new Set<Listener>());

const encoder = new TextEncoder();

function broadcast(): void {
  const frame = encoder.encode(`data: ${JSON.stringify({ listeners: listeners.size })}\n\n`);
  for (const listener of listeners) {
    try {
      listener.enqueue(frame);
    } catch {
      listeners.delete(listener);
    }
  }
}

export function GET(request: Request): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      listeners.add(controller);
      broadcast();

      // Proxies drop a stream that says nothing for long enough.
      const beat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": beat\n\n"));
        } catch {
          clearInterval(beat);
        }
      }, LIVE.HEARTBEAT_MS);

      request.signal.addEventListener("abort", () => {
        clearInterval(beat);
        listeners.delete(controller);
        try {
          controller.close();
        } catch {
          // Already closed by the disconnect itself.
        }
        broadcast();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}
