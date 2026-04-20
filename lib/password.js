import crypto from "crypto";

const KEYLEN = 64;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, KEYLEN).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, expected] = storedHash.split(":");
  const derivedKey = crypto.scryptSync(password, salt, KEYLEN).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(derivedKey, "hex"));
}
