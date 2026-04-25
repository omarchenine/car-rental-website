import { randomBytes } from "crypto"

// Generate a secure random token (32 bytes = 256 bits)
export function generateSecureToken(): string {
  return randomBytes(32).toString("hex")
}

// Hash a string using built-in crypto (for non-password uses)
export function hashToken(token: string): string {
  const crypto = require("crypto")
  return crypto.createHash("sha256").update(token).digest("hex")
}

// Verify a token hash
export function verifyTokenHash(token: string, hash: string): boolean {
  return hashToken(token) === hash
}
