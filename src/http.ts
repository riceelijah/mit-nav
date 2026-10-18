import { httpPolicy } from "@mit-sdg/sync-engine-http/policy";
import { accountsHttp } from "./compositions/Accounts.ts";
import { commonsHttp } from "./compositions/Commons.ts";
import { passwordsHttp } from "./compositions/Passwords.ts";

/**
 * The address people open, which sign-in cookies are tied to: PUBLIC_ORIGIN when deployed
 * (https://<name>.mit-sdg.dev), otherwise the local frontend.
 */
export const publicOrigin = process.env.PUBLIC_ORIGIN ?? "http://127.0.0.1:8080";

export const policy = httpPolicy({
  publicOrigin,
  basePath: "/api",
  publicErrors: {
    ...accountsHttp.publicErrors,
    ...passwordsHttp.publicErrors,
    ...commonsHttp.publicErrors,
    DUPLICATE_PLACE: "CONFLICT",
    ALREADY_BLOCKED: "CONFLICT",
    NOT_BLOCKED: "CONFLICT",
    NO_SUCH_PLACE: "NOT_FOUND",
    NO_SUCH_LINK: "NOT_FOUND",
    ALREADY_FAVORITE: "CONFLICT",
    NOT_FAVORITE: "NOT_FOUND",
    TRIP_NAME_TAKEN: "CONFLICT",
    EMPTY_TRIP_NAME: "INVALID_REQUEST",
    NO_SUCH_TRIP: "NOT_FOUND",
    INVALID_DISTANCE: "INVALID_REQUEST",
  },
  cookies: {
    session: accountsHttp.sessionCookie("mitnav-session", [...passwordsHttp.startingSessions, ...commonsHttp.startingSessions]),
    signIn: commonsHttp.signInCookie("mitnav-sign-in"),
  },
});
