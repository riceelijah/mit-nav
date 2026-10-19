// Checks that the app answers: its health check reports the database reachable. Usage: bun scripts/check-api.ts [address] [--wait]
const address = process.argv.slice(2).find((arg) => !arg.startsWith("--")) ?? "http://127.0.0.1:3000";
// With --wait, keep trying for 60 seconds. That gives the containers time to start.
const deadline = Date.now() + (process.argv.includes("--wait") ? 60_000 : 0);

while (true) {
  const status = await fetch(`${address}/health`).then((r) => r.status, () => 0);
  if (status === 200) {
    console.log(`The app at ${address} answered and its database is up.`);
    break;
  }
  if (Date.now() > deadline) {
    console.error(`Could not reach the app at ${address} (status ${status || "no answer"}).`);
    process.exit(1);
  }
  await Bun.sleep(1000);
}
