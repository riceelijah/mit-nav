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
    "/plans/:file": async (request) => {
      const file = request.params.file;
      const plan = Bun.file(new URL(`./plans/${file}`, import.meta.url));
      if (!/^[A-Z0-9]+\.json$/.test(file) || !(await plan.exists())) return new Response("Not found", { status: 404 });
      // Always checked again: plans change whenever the map is regenerated, and a stale one draws old shapes.
      return new Response(plan, { headers: { "Cache-Control": "no-cache" } });
    },
    // MIT's own drawings, fitted by scripts/fit-drawings.py, exist only on a machine that made them (see the README).
    "/drawings/:file": async (request) => {
      const file = request.params.file;
      const drawing = Bun.file(new URL(`../data/raw/drawings/${file}`, import.meta.url));
      if (!/^([A-Z0-9]+_[A-Z0-9]+\.png|index\.json)$/.test(file) || !(await drawing.exists())) return new Response("Not found", { status: 404 });
      return new Response(drawing, { headers: { "Cache-Control": "no-store" } });
    },
    "/health": proxy,
  },
});

console.log(`Frontend listening on ${server.url}`);
