async function main() {
  const response = await fetch("http://localhost:8787/stream", {
    duplex: "half",
    method: "POST",
    body: JSON.stringify({}),
    headers: {
      "Accept-Encoding": "identity",
    },
  });

  console.log("client headers", Object.fromEntries(response.headers));

  for await (const chunk of response.body) {
    console.log("Client>", new TextDecoder().decode(chunk));
  }
}

main().catch((error) => {
  console.error(error);
});
