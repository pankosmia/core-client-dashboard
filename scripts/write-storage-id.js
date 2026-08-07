const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const BUILD_DIR = path.resolve(__dirname, "..", "build");
const FILE_PATH = path.join(BUILD_DIR, "storage_id.json");

fs.mkdirSync(BUILD_DIR, { recursive: true });

fs.writeFileSync(
  FILE_PATH,
  JSON.stringify({ id: crypto.randomUUID() }, null, 2),
  "utf8",
);

console.log(`Wrote ${FILE_PATH}`);
