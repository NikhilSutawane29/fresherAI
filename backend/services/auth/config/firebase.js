import { initializeApp, cert } from "firebase-admin/app";
import fs from "fs";

const keyPath = fs.existsSync("/etc/secrets/serviceAccKey.json")
  ? "/etc/secrets/serviceAccKey.json"
  : new URL("../serviceAccKey.json", import.meta.url);

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

export const app = initializeApp({
  credential: cert(serviceAccount),
});
