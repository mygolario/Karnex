import { createHash, randomBytes } from "crypto";
import { KARNEX_API_KEY_PREFIX } from "./constants";

export function hashApiKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const raw = `${KARNEX_API_KEY_PREFIX}${randomBytes(24).toString("hex")}`;
  const hash = hashApiKey(raw);
  const prefix = raw.slice(0, 12);
  return { raw, hash, prefix };
}
