import { httpPolicy } from "@mit-sdg/sync-engine-http/policy";

export const policy = httpPolicy({
  basePath: "/api",
  publicErrors: {
    DUPLICATE_PLACE: "CONFLICT",
    ALREADY_BLOCKED: "CONFLICT",
    NOT_BLOCKED: "CONFLICT",
    NO_SUCH_PLACE: "NOT_FOUND",
    NO_SUCH_LINK: "NOT_FOUND",
  },
});
