// Send the shrunk drawings and their index to a server, which keeps them in its S3 storage (see web/server.ts).
// Usage: DRAWINGS_UPLOAD_TOKEN=… bun scripts/upload-drawings.ts data/raw/drawings-small https://mit-nav.mit-sdg.dev
import { readdirSync } from "node:fs";
import { join } from "node:path";

const [dir, server] = process.argv.slice(2);
const token = process.env.DRAWINGS_UPLOAD_TOKEN;
if (!dir || !server || !token) throw new Error("Usage: DRAWINGS_UPLOAD_TOKEN=… bun scripts/upload-drawings.ts <dir> <server>");
// the index goes last, so the page offers a drawing only once it is there
const files = readdirSync(dir).filter((f) => f.endsWith(".png")).sort().concat("index.json");
let sent = 0;
for (const file of files) {
  const answer = await fetch(new URL(`/drawings/${file}`, server), {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: Bun.file(join(dir, file)),
  });
  if (!answer.ok) throw new Error(`${file}: ${answer.status} ${await answer.text()}`);
  sent++;
}
console.log(`Uploaded ${sent} files to ${server}`);
