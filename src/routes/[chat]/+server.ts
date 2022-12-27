import type { RequestHandler } from "./$types";

/* for each user, keep a controller for their stream and a reference to the chat they are visiting */
export const streams: Record<
  string,
  { controller: ReadableStreamDefaultController<string>; chat: string }
> = {};

export const GET: RequestHandler = async ({ locals, params }) => {
  const stream = new ReadableStream<string>({
    start(controller) {
      /* save the controller for the stream so that we can */
      /* enqueue messages into the stream */
      streams[locals.userid!] = { controller, chat: params.chat };
    },
    cancel() {
      /* remove the stream */
      delete streams[locals.userid!];
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
    },
  });
};
