import fs from "fs";

// Uses Render's Secret File if deployed, otherwise uses your local file
const keyPath = fs.existsSync("/etc/secrets/serviceAccKey.json")
  ? "/etc/secrets/serviceAccKey.json"
  : new URL("../serviceAccKey.json", import.meta.url);

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
