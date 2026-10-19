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

/** A start, the text naming a kind of place, a step-free flag and an hour, for the nearest-of-a-kind search. */
export const closestInput: EndpointValidator = (value) => {
  const b = value as Record<string, unknown> | null;
  const ok = typeof b === "object" && b !== null && typeof b.source === "string" && typeof b.text === "string" &&
    typeof b.accessibleOnly === "boolean" && typeof b.hour === "number" && Number.isFinite(b.hour);
  return ok ? { ok: true } : { ok: false, detail: "expected source, text, accessibleOnly and hour" };
};

/** signedIn(...) plus units that are one of METERS, FEET, MINUTES. */
export const preferencesInput: EndpointValidator = (value) => {
  const base = signedIn("stepFree", "useLocation", "units")(value);
  if (!base.ok) return base;
  const units = (value as Record<string, unknown>).units;
  return units === "METERS" || units === "FEET" || units === "MINUTES" ? { ok: true } : { ok: false, detail: "units must be METERS, FEET or MINUTES" };
};
