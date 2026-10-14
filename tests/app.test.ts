import { expect, test } from "bun:test";
import { createGateway } from "@mit-sdg/sync-engine/boundary";
import { createHttpHandler } from "@mit-sdg/sync-engine-http/handler";
import { assembleApplication } from "../src/assembly.ts";
import { policy } from "../src/http.ts";
import { freshDb } from "./helpers.ts";

// Core user journey, end to end through the HTTP API with an empty database.
test("journey: find route, block elevator, reroute, clear it", async () => {
  const { db, close } = await freshDb();
  const application = assembleApplication(db);
  const api = createHttpHandler({ application, gateway: createGateway({ application }), policy });
  const post = async (path: string, body: object) =>
    (await api(new Request(`http://x/api${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }))).json() as Promise<any>;

  const lobby = (await post("/map/add-place", { name: "Lobby", kind: "HALLWAY", floor: 1 })).place;
  const room = (await post("/map/add-place", { name: "Room 215", kind: "ROOM", floor: 2 })).place;
  const elevator = (await post("/map/connect", { source: lobby, destination: room, forward: "Elevator up", backward: "Elevator down", accessible: true, closedFrom: 0, closedUntil: 0, service: "", distance: 1 })).link;
  await post("/map/connect", { source: lobby, destination: room, forward: "Stairs up", backward: "Stairs down", accessible: false, closedFrom: 0, closedUntil: 0, service: "", distance: 1 });

  const route = (acc: boolean) => post("/route/find", { source: lobby, destination: room, accessibleOnly: acc, hour: 12 });
  expect((await route(true)).route.steps.map((s: any) => s.instruction)).toEqual(["Elevator up"]);

  const blocked = await post("/problems/block", { link: elevator, reporter: "Iris", reason: "Out of service" });
  expect(blocked.report).toBeTruthy();
  expect((await route(true)).route.steps).toEqual([]);
  expect((await route(false)).route.steps.map((s: any) => s.instruction)).toEqual(["Stairs up"]);

  const overview = await post("/map/overview", {});
  expect(overview.problems.reports.map((r: any) => [r.reporter, r.reason])).toEqual([["Iris", "Out of service"]]);
  expect(overview.overview.links.find((l: any) => l.link === elevator).blocked).toBe(true);

  const again = await post("/problems/block", { link: elevator, reporter: "Bo", reason: "dup" });
  expect(again.error).toBe("CONFLICT");

  await post("/problems/unblock", { link: elevator });
  expect((await route(true)).route.steps.length).toBe(1);
  expect((await post("/map/overview", {})).problems.reports).toEqual([]);
  await close();
});
