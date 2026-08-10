const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const REPO_DIR = path.resolve(__dirname, "..");
const FILE_PATH = path.join(REPO_DIR, "storage_id.json");

fs.mkdirSync(REPO_DIR, { recursive: true });

fs.writeFileSync(
  FILE_PATH,
  JSON.stringify({ id: crypto.randomUUID() }, null, 2),
  "utf8",
);

console.log(`Wrote ${FILE_PATH}`);
