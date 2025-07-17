import { Container, loadBalance, getContainer } from "@cloudflare/containers";
import { Hono } from "hono";

export class MyContainer extends Container {
  // Port the container listens on (default: 8080)
  defaultPort = 8080;
  // Time before container sleeps due to inactivity (default: 30s)
  sleepAfter = "2m";

  override onStart() {
    console.log("Container successfully started");
  }

  override onStop() {
    console.log("Container successfully shut down");
  }

  override onError(error: unknown) {
    console.log("Container error:", error);
  }

  async stream() {
    const response = await this.containerFetch("http://container/stream", {
      method: "POST",
      body: JSON.stringify({
        message: "Hello, world!",
      }),
    });

    return new Response(response.body, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    });
  }
}

// Create Hono app with proper typing for Cloudflare Workers
const app = new Hono<{
  Bindings: { MY_CONTAINER: DurableObjectNamespace<MyContainer> };
}>();

// Home route with available endpoints
app.post("/stream", async (c) => {
  const container = getContainer(c.env.MY_CONTAINER);
  const response = await container.stream();

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response.body!) {
        console.log("Worker>", new TextDecoder().decode(chunk));
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  });
});

export default app;
