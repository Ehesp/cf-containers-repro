# CF Containers Repro - Streaming

This repo contains a reproduction of an issue on Cloudflare Containers.

## Setup

- Container: Bun server returning a ReadableStream endpoint, which enqueues a message every second for 10 seconds.
- DO: Proxies to the stream endpoint
- Worker: RPC to the DO `stream` method
- `test.mjs`: A simple node script to consume the stream

## Issue

When running the node script against the container, `node text.mjs` we get the following, inconsistent output:

Run 1:

```
client headers {
  'cache-control': 'no-cache',
  'content-encoding': 'identity',
  'content-type': 'text/plain',
  date: 'Thu, 17 Jul 2025 08:54:32 GMT',
  'transfer-encoding': 'chunked'
}
Client> Hello, world! 10
Client> Hello, world! 9
```

Run 2:

```
client headers {
  'cache-control': 'no-cache',
  'content-encoding': 'identity',
  'content-type': 'text/plain',
  date: 'Thu, 17 Jul 2025 08:58:56 GMT',
  'transfer-encoding': 'chunked'
}
Client> Hello, world! 10
Client> Hello, world! 9
Client> Hello, world! 8
Client> Hello, world! 7
Client> Hello, world! 6
Client> Hello, world! 5
Client> Hello, world! 4
```

Note; sometimes it does complete.

I've tried a whole bunch of things - proxying the stream at each layer, e.g.

```ts
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
```

However the results are the same.