/** The result, or a test failure naming the error the endpoint returned. */
export function ok<T>(result: T): Exclude<T, { error: unknown }> {
  if (typeof result === "object" && result !== null && "error" in result) {
    throw new Error(`Expected a result, got ${JSON.stringify(result)}`);
  }
  return result as Exclude<T, { error: unknown }>;
}

/** Waits until `check` passes, for work that finishes after a request has been answered. */
export async function eventually<T>(check: () => Promise<T>): Promise<T> {
  const deadline = Date.now() + 3_000;
  for (;;) {
    try {
      return await check();
    } catch (error) {
      if (Date.now() > deadline) throw error;
      await Bun.sleep(20);
    }
  }
}
