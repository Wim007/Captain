// Static app: nothing to compile. Verifies that the public assets exist.
import { existsSync } from "node:fs";
const required = ["public/index.html", "public/app.js", "public/styles.css", "server.js"];
const missing = required.filter((f) => !existsSync(f));
if (missing.length) {
  console.error("Build failed, missing files:", missing.join(", "));
  process.exit(1);
}
console.log("Build OK - static assets present.");
