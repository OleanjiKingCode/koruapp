import crypto from "crypto";

/**
 * Chat message encryption using AES-256-GCM.
 *
 * Messages are encrypted server-side before being stored in the database
 * and decrypted when fetched. The encryption key is kept in the
 * CHAT_ENCRYPTION_KEY environment variable (server-only, never exposed
 * to the client).
 *
 * Encrypted format: iv:authTag:ciphertext (all hex-encoded)
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128-bit IV for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit auth tag

/**
 * Derive a 32-byte key from the environment variable using SHA-256.
 * This lets the env var be any length/format while always producing
 * a valid 256-bit AES key.
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.CHAT_ENCRYPTION_KEY;
  if (!envKey) {
    throw new Error(
      "CHAT_ENCRYPTION_KEY environment variable is not set. " +
        "Generate one with: openssl rand -hex 32",
    );
  }
  return crypto.createHash("sha256").update(envKey).digest();
}

/**
 * Encrypt a plaintext string.
 * Returns the encrypted payload as "iv:authTag:ciphertext" (hex).
 * Returns the original string unchanged if encryption is not configured.
 */
export function encrypt(plaintext: string): string {
  if (!process.env.CHAT_ENCRYPTION_KEY) {
    // Graceful fallback — store plaintext if key is not set yet
    return plaintext;
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");

    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error("Encryption failed, storing plaintext:", error);
    return plaintext;
  }
}

/**
 * Decrypt an encrypted string.
 * Expects the format "iv:authTag:ciphertext" (hex).
 * If the input doesn't look encrypted (no colons), returns it as-is
 * for backwards compatibility with existing plaintext messages.
 */
export function decrypt(encryptedText: string): string {
  if (!process.env.CHAT_ENCRYPTION_KEY) {
    // No key configured — return as-is
    return encryptedText;
  }

  // Check if this looks like an encrypted payload (iv:authTag:ciphertext)
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    // Not encrypted (legacy plaintext message) — return as-is
    return encryptedText;
  }

  const [ivHex, authTagHex, ciphertext] = parts;

  // Validate hex format (IV should be 32 hex chars = 16 bytes)
  if (
    ivHex.length !== IV_LENGTH * 2 ||
    authTagHex.length !== AUTH_TAG_LENGTH * 2
  ) {
    // Doesn't match expected encrypted format — treat as plaintext
    return encryptedText;
  }

  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption failed, returning raw content:", error);
    // If decryption fails (wrong key, corrupted data), return raw
    return encryptedText;
  }
}

/**
 * Decrypt a message object's content field in-place.
 * Safe to call on messages that may or may not be encrypted.
 */
export function decryptMessage<T extends { content: string }>(message: T): T {
  return {
    ...message,
    content: decrypt(message.content),
  };
}

/**
 * Decrypt an array of message objects.
 */
export function decryptMessages<T extends { content: string }>(
  messages: T[],
): T[] {
  return messages.map(decryptMessage);
}
