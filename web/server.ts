import homepage from "./index.html";

const backend = process.env.BACKEND_URL ?? "http://127.0.0.1:3000";

// Pass API requests and health checks on to the backend.
function proxy(request: Request) {
  const url = new URL(request.url);
  return fetch(new URL(url.pathname + url.search, backend), request).catch(
    () => Response.json({ error: "UNAVAILABLE" }, { status: 503 }),
  );
}

// Whether the request's session belongs to an account signed in with Commons.
async function linked(request: Request) {
  const answer = await fetch(new URL("/api/auth/commons/linked", backend), {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: request.headers.get("Cookie") ?? "" },
    body: "{}",
  }).catch(() => null);
  return answer?.ok === true && (await answer.json()).linked === true;
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
      if (!/^([A-Z0-9]+|index)\.json$/.test(file) || !(await plan.exists())) return new Response("Not found", { status: 404 });
      // Always checked again: plans change whenever the map is regenerated, and a stale one draws old shapes.
      return new Response(plan, { headers: { "Cache-Control": "no-cache" } });
    },
    // MIT's own drawings, fitted by scripts/fit-drawings.py, exist only where they were made or copied (see the README),
    // and are shown only to someone signed in with Commons, so with MIT's login (MIT Facilities' condition).
    "/drawings/:file": async (request) => {
      const file = request.params.file;
      const drawing = Bun.file(new URL(`../data/raw/drawings/${file}`, import.meta.url));
      // Signed in first, so someone who isn't can't tell which drawings exist.
      if (!(await linked(request))) return new Response("Sign in with Commons to see MIT's drawings", { status: 403 });
      if (!/^([A-Z0-9]+_[A-Z0-9]+\.png|index\.json)$/.test(file) || !(await drawing.exists())) return new Response("Not found", { status: 404 });
      return new Response(drawing, { headers: { "Cache-Control": "no-store" } });
    },
    "/health": proxy,
  },
});

console.log(`Frontend listening on ${server.url}`);
