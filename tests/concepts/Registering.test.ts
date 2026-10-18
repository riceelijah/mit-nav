import { describe, expect, test } from "bun:test";
import {
  InvalidUsername,
  RegisteringConcept,
  type User,
  UsernameTaken,
} from "../../src/concepts/Registering/Registering.ts";
import { testDatabase } from "../support/reusable/mongo.ts";
import { expectOneWinner } from "../support/reusable/race.ts";

async function setup() {
  return { registering: new RegisteringConcept(await testDatabase()) };
}

describe("Registering", () => {
  test("its principle: Sam finds Maya by her username, and Ben registers another when hers is taken", async () => {
    const { registering } = await setup();

    const { user: maya } = await registering.register({ username: "maya" });
    expect(await registering._byUsername({ username: "maya" })).toEqual([{ user: maya }]);
    expect(await registering._username({ user: maya })).toEqual([{ username: "maya" }]);

    const taken = registering.register({ username: "maya" });
    await expect(taken).rejects.toThrow(UsernameTaken);
    await expect(taken).rejects.toThrow("That username is taken.");
    const { user: ben } = await registering.register({ username: "ben" });
    expect(ben).not.toBe(maya);
  });

  test("a username must have 3 to 32 ASCII letters, digits, underscores, or hyphens", async () => {
    const { registering } = await setup();
    for (const username of ["ma", "x".repeat(33), "maya lee", "maya!", ""]) {
      await expect(registering.register({ username })).rejects.toThrow(InvalidUsername);
    }
    for (const username of ["abc", "x".repeat(32), "maya_lee-2"]) {
      await registering.register({ username });
    }
  });

  test("usernames are case-sensitive, so `Maya` is a different username from `maya`", async () => {
    const { registering } = await setup();
    const { user: maya } = await registering.register({ username: "maya" });
    const { user: other } = await registering.register({ username: "Maya" });
    expect(other).not.toBe(maya);
  });

  test("of two registrations of one username at once, one succeeds and the other is refused with USERNAME_TAKEN", async () => {
    const { registering } = await setup();
    await expectOneWinner(
      [registering.register({ username: "maya" }), registering.register({ username: "maya" })],
      UsernameTaken,
    );
  });

  test("_username and _byUsername return no row for an unknown user or username", async () => {
    const { registering } = await setup();
    expect(await registering._username({ user: "missing" as User })).toEqual([]);
    expect(await registering._byUsername({ username: "nobody" })).toEqual([]);
  });
});
