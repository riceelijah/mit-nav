import type { EndpointValidator } from "@mit-sdg/sync-engine/boundary";

/** Accepts a request body whose fields are all strings; `session` and `attempt` are null when the browser sent no cookie. The endpoint's receive clause names the required fields. */
export const textInput: EndpointValidator = (value) => {
  const ok =
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.entries(value).every(
      ([name, field]) => typeof field === "string" || (field === null && (name === "session" || name === "attempt")),
    );
  return ok ? { ok: true } : { ok: false, detail: "expected text fields" };
};
/**
 * Accepts a body with every named field present, plus `session`, which is null when the browser sent no
 * cookie; Sessioning.use then refuses with NOT_SIGNED_IN instead of the request failing validation.
 */
export const signedIn =
  (...fields: string[]): EndpointValidator =>
  (value) => {
    const body = value as Record<string, unknown> | null;
    const ok =
      typeof body === "object" &&
      body !== null &&
      !Array.isArray(body) &&
      (typeof body.session === "string" || body.session === null || body.session === undefined) &&
      fields.every((field) => body[field] !== undefined && body[field] !== null);
    return ok ? { ok: true } : { ok: false, detail: `expected ${fields.join(", ")}` };
  };

/** Accepts a body whose named fields are all finite numbers, such as a latitude and longitude. */
export const numbers =
  (...fields: string[]): EndpointValidator =>
  (value) => {
    const body = value as Record<string, unknown> | null;
    const ok = typeof body === "object" && body !== null && fields.every((f) => typeof body[f] === "number" && Number.isFinite(body[f]));
    return ok ? { ok: true } : { ok: false, detail: `expected numbers ${fields.join(", ")}` };
  };

type Body = Record<string, unknown>;
const isBody = (v: unknown): v is Body => typeof v === "object" && v !== null && !Array.isArray(v);
const isHour = (h: unknown) => typeof h === "number" && h >= 0 && h <= 24;
const isDay = (d: unknown) => Number.isInteger(d) && (d as number) >= 0 && (d as number) <= 6;

/** Two places (text), step-free, indoors and no-MIT-ID flags (true or false), an hour from 0 to 24 and a day from 0 (Sunday) to 6, for a route. */
export const routeInput: EndpointValidator = (b) =>
  isBody(b) && typeof b.source === "string" && typeof b.destination === "string" && typeof b.accessibleOnly === "boolean" && typeof b.indoorsPreferred === "boolean" && isHour(b.hour) && typeof b.keyless === "boolean" && isDay(b.day)
    ? { ok: true }
    : { ok: false, detail: "expected source, destination (text), accessibleOnly, indoorsPreferred and keyless (true or false), hour (0 to 24) and day (0 to 6)" };

/** A start, the text naming a kind of place, the three flags, an hour and a day as for a route, for the nearest-of-a-kind search. */
export const closestInput: EndpointValidator = (b) =>
  isBody(b) && typeof b.source === "string" && typeof b.text === "string" && typeof b.accessibleOnly === "boolean" && typeof b.indoorsPreferred === "boolean" && isHour(b.hour) && typeof b.keyless === "boolean" && isDay(b.day)
    ? { ok: true }
    : { ok: false, detail: "expected source, text, accessibleOnly, indoorsPreferred and keyless (true or false), hour (0 to 24) and day (0 to 6)" };

/** signedIn(...) plus a text name and places and a true-or-false step-free flag, for saving a trip. */
export const tripInput: EndpointValidator = (value) => {
  const base = signedIn("name", "source", "destination", "accessibleOnly")(value);
  if (!base.ok) return base;
  const b = value as Body;
  return typeof b.name === "string" && typeof b.source === "string" && typeof b.destination === "string" && typeof b.accessibleOnly === "boolean"
    ? { ok: true }
    : { ok: false, detail: "expected name, source, destination (text) and accessibleOnly (true or false)" };
};

/** signedIn(...) plus text places and metres that are a finite number, for a finished trip. */
export const finishInput: EndpointValidator = (value) => {
  const base = signedIn("source", "destination", "meters")(value);
  if (!base.ok) return base;
  const b = value as Body;
  return typeof b.source === "string" && typeof b.destination === "string" && typeof b.meters === "number" && Number.isFinite(b.meters)
    ? { ok: true }
    : { ok: false, detail: "expected source, destination (text) and meters (a number)" };
};

/** signedIn(...) plus units that are one of METERS, FEET, MINUTES. */
export const preferencesInput: EndpointValidator = (value) => {
  const base = signedIn("stepFree", "indoors", "useLocation", "units")(value);
  if (!base.ok) return base;
  const units = (value as Record<string, unknown>).units;
  return units === "METERS" || units === "FEET" || units === "MINUTES" ? { ok: true } : { ok: false, detail: "units must be METERS, FEET or MINUTES" };
};
