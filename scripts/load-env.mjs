import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

let fileEnv = {};
try {
  const envPath = resolve(__dirname, "..", ".env.local");
  const envContent = readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) fileEnv[match[1].trim()] = match[2].trim();
  }
} catch {
  // .env.local no existe (ej: GitHub Actions)
}

export function getEnv(key) {
  return process.env[key] || fileEnv[key];
}
