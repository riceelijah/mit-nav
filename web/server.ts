import homepage from "./index.html";

const backend = process.env.BACKEND_URL ?? "http://127.0.0.1:3000";

// Pass API requests and health checks on to the backend.
function proxy(request: Request) {
  const url = new URL(request.url);
  return fetch(new URL(url.pathname + url.search, backend), request).catch(
    () => Response.json({ error: "UNAVAILABLE" }, { status: 503 }),
  );
}

const server = Bun.serve({
  hostname: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.PORT ?? 8080),
  routes: {
    "/": homepage,
    // Commons sends the browser back here with a one-time code; the page finishes signing in.
    "/auth/commons/callback": homepage,
    "/api/*": proxy,
    // One floor-plan file per building, written by the campus converter.
    "/plans/:file": (request) => {
      const file = request.params.file;
      if (!/^[A-Z0-9]+\.json$/.test(file)) return new Response("Not found", { status: 404 });
      return new Response(Bun.file(new URL(`./plans/${file}`, import.meta.url)), { headers: { "Cache-Control": "public, max-age=3600" } });
    },
    "/health": proxy,
  },
});

console.log(`Frontend listening on ${server.url}`);
