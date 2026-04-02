const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// Key derived from env var — must be exactly 32 bytes (256 bits)
function getKey() {
  const secret = process.env.BOT_TOKEN_SECRET || "default-secret-change-in-production!";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypt a plaintext string. Returns "iv:tag:ciphertext" in hex.
 */
function encrypt(plaintext) {
  if (!plaintext) return "";
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt an "iv:tag:ciphertext" hex string back to plaintext.
 * Returns empty string if decryption fails (e.g. wrong key, corrupted data).
 */
function decrypt(encryptedStr) {
  if (!encryptedStr) return "";
  // Handle unencrypted legacy tokens (no ":" separators)
  if (!encryptedStr.includes(":")) return encryptedStr;
  try {
    const parts = encryptedStr.split(":");
    if (parts.length !== 3) return encryptedStr; // Legacy plain token
    const iv = Buffer.from(parts[0], "hex");
    const tag = Buffer.from(parts[1], "hex");
    const ciphertext = parts[2];
    const key = getKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    // If decryption fails, assume it's a legacy plain token
    return encryptedStr;
  }
}

module.exports = { encrypt, decrypt };
