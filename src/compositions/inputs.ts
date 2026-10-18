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
