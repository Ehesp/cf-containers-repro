import { Hono } from "hono";

const app = new Hono();

app.post("/stream", async (c) => {
  let remaining = 10;
  const stream = new ReadableStream({
    async start(controller) {
      while (remaining > 0) {
        console.log("enqueue:", remaining);
        controller.enqueue(
          new TextEncoder().encode(`Hello, world! ${remaining}\n\n`)
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        remaining--;
      }

      console.log("closing stream");
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Content-Encoding": "identity",
    },
  });
});

Bun.serve({
  fetch: app.fetch,
  port: 8080,
});

console.log("container started on port 8080");
