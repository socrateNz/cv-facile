import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const CSRF_TOKEN_COOKIE = "csrf-token";
const CSRF_HEADER = "x-csrf-token";

// Simple in-memory store for CSRF tokens (in production, use Redis)
const csrfTokens = new Map<string, { token: string; expiresAt: number }>();

const CSRF_TOKEN_EXPIRY = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Get or create CSRF token for a session
 */
export function getCSRFToken(sessionId: string): string {
  const existing = csrfTokens.get(sessionId);
  
  if (existing && existing.expiresAt > Date.now()) {
    return existing.token;
  }

  const token = generateCSRFToken();
  csrfTokens.set(sessionId, {
    token,
    expiresAt: Date.now() + CSRF_TOKEN_EXPIRY,
  });

  return token;
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  
  if (!stored) return false;
  if (stored.expiresAt < Date.now()) {
    csrfTokens.delete(sessionId);
    return false;
  }

  const valid = stored.token === token;
  
  // Invalidate token after use (optional - depends on use case)
  // csrfTokens.delete(sessionId);
  
  return valid;
}

/**
 * Middleware to verify CSRF token on unsafe methods (POST, PUT, DELETE, PATCH)
 */
export function verifyCSRF(req: NextRequest): boolean {
  // Skip for safe methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return true;
  }

  // Get CSRF token from header
  const headerToken = req.headers.get(CSRF_HEADER);
  if (!headerToken) {
    return false;
  }

  // Get session ID from cookie (or any unique session identifier)
  const sessionId = req.cookies.get("cvfacile_token")?.value;
  if (!sessionId) {
    return false;
  }

  return verifyCSRFToken(sessionId, headerToken);
}

/**
 * Cleanup expired CSRF tokens
 * Call this periodically (e.g., via a cron job)
 */
export function cleanupExpiredCSRFTokens() {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (data.expiresAt < now) {
      csrfTokens.delete(sessionId);
    }
  }
}

// Cleanup every hour
setInterval(cleanupExpiredCSRFTokens, 1000 * 60 * 60);
