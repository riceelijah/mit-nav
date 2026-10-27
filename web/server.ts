import { timingSafeEqual } from "node:crypto";
import { s3 } from "bun";
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

const DRAWING = /^([A-Z0-9]+_[A-Z0-9]+\.png|index\.json)$/;
// Bun's S3 client reads its bucket and keys from S3_* (or AWS_*) variables, which adding S3 storage sets.
const STORAGE = !!(process.env.S3_BUCKET ?? process.env.AWS_BUCKET);

// An upload carries the token set on this server; with none set, nothing is accepted.
function uploadAllowed(request: Request) {
  const token = process.env.DRAWINGS_UPLOAD_TOKEN ?? "";
  const given = Buffer.from(request.headers.get("Authorization")?.replace(/^Bearer /, "") ?? "");
  return token.length >= 32 && given.length === token.length && timingSafeEqual(given, Buffer.from(token));
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
    // MIT's own drawings, fitted by scripts/fit-drawings.py, are kept in the app's S3 storage where
    // scripts/upload-drawings.ts sent them, or in the local folder where they were made, and are shown only to someone
    // signed in with Commons, so with MIT's login (MIT Facilities' condition).
    "/drawings/:file": {
      GET: async (request) => {
        const file = request.params.file;
        // Signed in first, so someone who isn't can't tell which drawings exist.
        if (!(await linked(request))) return new Response("Sign in with Commons to see MIT's drawings", { status: 403 });
        if (!DRAWING.test(file)) return new Response("Not found", { status: 404 });
        const headers = { "Cache-Control": "no-store", "Content-Type": file.endsWith(".png") ? "image/png" : "application/json" };
        const stored = STORAGE ? s3.file(`drawings/${file}`) : null;
        if (stored && (await stored.exists().catch(() => false))) return new Response(stored.stream(), { headers });
        const local = Bun.file(new URL(`../data/raw/drawings/${file}`, import.meta.url));
        return (await local.exists()) ? new Response(local, { headers }) : new Response("Not found", { status: 404 });
      },
      PUT: async (request) => {
        const file = request.params.file;
        if (!STORAGE || !uploadAllowed(request)) return new Response("Uploads need the upload token and S3 storage", { status: 403 });
        if (!DRAWING.test(file)) return new Response("Not a drawing's name", { status: 400 });
        await s3.write(`drawings/${file}`, await request.arrayBuffer(), { type: file.endsWith(".png") ? "image/png" : "application/json" });
        return new Response(null, { status: 204 });
      },
    },
    "/health": proxy,
  },
});

console.log(`Frontend listening on ${server.url}`);
