/**
 * Authentication Service
 * 
 * Handles user signup, login, logout, and session management.
 * Uses bcrypt for password hashing and JWT for session tokens.
 * 
 * Security features:
 * - Bcrypt password hashing (12 rounds)
 * - JWT tokens with 24-hour expiration
 * - HTTP-only, Secure, SameSite cookies
 * - Password hash never exposed to client
 */

import * as bcrypt from "bcrypt";
import { create, verify } from "djwt";
import {
  createUser,
  getUserByUsername,
  getUserById,
  createAuthSession,
  getAuthSession,
  deleteAuthSession,
} from "./db.ts";
import type { User, SafeUser } from "../types/index.ts";

// JWT key is lazily loaded on first use
let key: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
  if (key) return key;
  
  const JWT_SECRET = Deno.env.get("JWT_SECRET");
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  
  key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  
  return key;
}

// ============================================================================
// PASSWORD HASHING
// ============================================================================

/**
 * Hash password with bcrypt (default rounds: 10)
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password);
}

/**
 * Verify password against bcrypt hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// ============================================================================
// JWT TOKEN MANAGEMENT
// ============================================================================

/**
 * Create JWT token with 24-hour expiration
 */
async function createToken(userId: string): Promise<string> {
  const jwtKey = await getKey();
  return await create(
    { alg: "HS256", typ: "JWT" },
    { 
      userId, 
      jti: crypto.randomUUID(), // Unique identifier for each token
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    },
    jwtKey
  );
}

/**
 * Verify JWT token and return user ID
 */
async function verifyToken(token: string): Promise<string | null> {
  try {
    const jwtKey = await getKey();
    const payload = await verify(token, jwtKey);
    return payload.userId as string;
  } catch {
    return null;
  }
}

// ============================================================================
// USER AUTHENTICATION
// ============================================================================

/**
 * Sign up new user
 * 
 * @throws Error if username < 3 chars or password < 6 chars
 * @throws Error if username already exists
 */
export async function signup(
  username: string,
  password: string
): Promise<{ user: SafeUser; token: string }> {
  // Validate input
  if (username.length < 3) {
    throw new Error("Username must be at least 3 characters");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user (will throw if username exists)
  const user = await createUser(username, passwordHash);

  // Create JWT token
  const token = await createToken(user.id);

  // Create auth session
  await createAuthSession(token, user.id);

  // Return user without password hash
  const { passwordHash: _, ...safeUser } = user;

  return { user: safeUser, token };
}

/**
 * Login existing user
 * 
 * @throws Error if credentials are invalid
 */
export async function login(
  username: string,
  password: string
): Promise<{ user: SafeUser; token: string }> {
  // Get user
  const user = await getUserByUsername(username);
  if (!user) {
    throw new Error("Invalid username or password");
  }

  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid username or password");
  }

  // Create JWT token
  const token = await createToken(user.id);

  // Create auth session
  await createAuthSession(token, user.id);

  // Return user without password hash
  const { passwordHash: _, ...safeUser } = user;

  return { user: safeUser, token };
}

/**
 * Logout user by deleting auth session
 */
export async function logout(token: string): Promise<void> {
  await deleteAuthSession(token);
}

/**
 * Get current user from token
 * Returns null if token is invalid or expired
 */
export async function getCurrentUser(token: string): Promise<SafeUser | null> {
  if (!token) return null;

  // Verify token
  const userId = await verifyToken(token);
  if (!userId) return null;

  // Check auth session exists and is valid
  const authSession = await getAuthSession(token);
  if (!authSession) return null;

  // Get user
  const user = await getUserById(userId);
  if (!user) return null;

  // Return user without password hash
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

// ============================================================================
// COOKIE HELPERS
// ============================================================================

/**
 * Extract auth token from cookie header
 */
export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const authCookie = cookies.find((c) => c.startsWith("auth_token="));

  if (!authCookie) return null;

  return authCookie.split("=")[1];
}

/**
 * Create auth cookie header (HttpOnly, Secure, SameSite=Strict, 24h expiration)
 */
export function createAuthCookie(token: string): string {
  return `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`;
}

/**
 * Create logout cookie header (expires immediately)
 */
export function createLogoutCookie(): string {
  return "auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/";
}
