#!/usr/bin/env node
import { createHash } from "crypto";
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

let POLAR_PW = process.env.AUTH_POLAR_PASSWORD;
let HAVOLINE_PW = process.env.AUTH_HAVOLINE_PASSWORD;

if (!POLAR_PW || !HAVOLINE_PW) {
  try {
    const envContent = readFileSync(join(ROOT, ".env.local"), "utf8");
    for (const line of envContent.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) {
        const k = m[1].trim(), v = m[2].trim();
        if (k === "AUTH_POLAR_PASSWORD" && !POLAR_PW) POLAR_PW = v;
        if (k === "AUTH_HAVOLINE_PASSWORD" && !HAVOLINE_PW) HAVOLINE_PW = v;
      }
    }
  } catch { /* .env.local not found */ }
}

if (!POLAR_PW) {
  console.error("ERROR: AUTH_POLAR_PASSWORD requerido");
  process.exit(1);
}

const credentials = [];
const hash = (pw) => createHash("sha256").update(pw).digest("hex");

credentials.push({ email: "admin@datalitica.com.co", hash: hash(POLAR_PW) });

if (HAVOLINE_PW) {
  credentials.push({ email: "havoline@datalitica.com.co", hash: hash(HAVOLINE_PW) });
}

const outDir = join(ROOT, "public", "data");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "auth.json");
writeFileSync(outPath, JSON.stringify(credentials));
console.log("Auth generada:", credentials.length, "usuarios");
