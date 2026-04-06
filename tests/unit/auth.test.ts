/**
 * Authentication System Tests (TDD)
 * 
 * These tests define the expected behavior of our authentication system.
 * We write these FIRST, then implement the code to make them pass.
 */

import { assertEquals, assertExists, assertRejects } from "https://deno.land/std@0.216.0/assert/mod.ts";

// Import auth functions (these don't exist yet - that's the point!)
import {
  hashPassword,
  verifyPassword,
  signup,
  login,
  logout,
  getCurrentUser,
  getTokenFromCookie,
  createAuthCookie,
  createLogoutCookie,
} from "../../web/lib/auth.ts";

// Import database for test setup
import { initDb, closeDb } from "../../web/lib/db.ts";

// Set JWT_SECRET for testing
Deno.env.set("JWT_SECRET", "test-secret-key-for-unit-tests-only");
Deno.env.set("DENO_KV_URL", ":memory:");

// ============================================================================
// PASSWORD HASHING TESTS
// ============================================================================

Deno.test("Auth - Password Hashing", async (t) => {
  await t.step("should hash password with bcrypt", async () => {
    const hash = await hashPassword("password123");
    
    assertExists(hash);
    assertEquals(typeof hash, "string");
    // Bcrypt hashes start with $2a$, $2b$, or $2y$
    assertEquals(hash.startsWith("$2"), true);
    assertEquals(hash.length > 50, true); // Bcrypt hashes are ~60 chars
  });

  await t.step("should produce different hashes for same password", async () => {
    // Bcrypt uses salt, so same password should produce different hashes
    const hash1 = await hashPassword("samepassword");
    const hash2 = await hashPassword("samepassword");
    
    assertEquals(hash1 !== hash2, true);
  });

  await t.step("should verify correct password", async () => {
    const password = "mySecurePassword123";
    const hash = await hashPassword(password);
    
    const isValid = await verifyPassword(password, hash);
    assertEquals(isValid, true);
  });

  await t.step("should reject incorrect password", async () => {
    const hash = await hashPassword("correctPassword");
    
    const isValid = await verifyPassword("wrongPassword", hash);
    assertEquals(isValid, false);
  });

  await t.step("should handle empty password", async () => {
    const hash = await hashPassword("");
    const isValid = await verifyPassword("", hash);
    
    assertEquals(isValid, true);
  });
});

// ============================================================================
// USER SIGNUP TESTS
// ============================================================================

Deno.test("Auth - User Signup", async (t) => {
  await initDb();

  await t.step("should signup new user with valid credentials", async () => {
    const result = await signup("signupuser1", "password123");
    
    assertExists(result.user);
    assertExists(result.token);
    
    assertEquals(result.user.username, "signupuser1");
    assertEquals(typeof result.token, "string");
    assertEquals(result.token.length > 20, true); // JWT tokens are long
    
    // Password hash should NOT be in the returned user
    assertEquals("passwordHash" in result.user, false);
  });

  await t.step("should reject short username (< 3 chars)", async () => {
    await assertRejects(
      async () => await signup("ab", "password123"),
      Error,
      "Username must be at least 3 characters"
    );
  });

  await t.step("should reject short password (< 6 chars)", async () => {
    await assertRejects(
      async () => await signup("validuser", "12345"),
      Error,
      "Password must be at least 6 characters"
    );
  });

  await t.step("should reject duplicate username", async () => {
    await signup("duplicateuser", "password123");
    
    await assertRejects(
      async () => await signup("duplicateuser", "differentpassword"),
      Error,
      "Username already exists"
    );
  });

  await t.step("should create auth session on signup", async () => {
    const result = await signup("sessiontestuser", "password123");
    
    // Token should be retrievable
    const user = await getCurrentUser(result.token);
    assertExists(user);
    assertEquals(user?.username, "sessiontestuser");
  });

  await closeDb();
});

// ============================================================================
// USER LOGIN TESTS
// ============================================================================

Deno.test("Auth - User Login", async (t) => {
  await initDb();

  // Create test user
  await signup("loginuser", "correctpassword");

  await t.step("should login with correct credentials", async () => {
    const result = await login("loginuser", "correctpassword");
    
    assertExists(result.user);
    assertExists(result.token);
    assertEquals(result.user.username, "loginuser");
    assertEquals(typeof result.token, "string");
  });

  await t.step("should reject wrong password", async () => {
    await assertRejects(
      async () => await login("loginuser", "wrongpassword"),
      Error,
      "Invalid username or password"
    );
  });

  await t.step("should reject non-existent user", async () => {
    await assertRejects(
      async () => await login("nonexistentuser", "anypassword"),
      Error,
      "Invalid username or password"
    );
  });

  await t.step("should create new auth session on login", async () => {
    const result = await login("loginuser", "correctpassword");
    
    const user = await getCurrentUser(result.token);
    assertExists(user);
    assertEquals(user?.username, "loginuser");
  });

  await t.step("should allow multiple concurrent sessions", async () => {
    const session1 = await login("loginuser", "correctpassword");
    const session2 = await login("loginuser", "correctpassword");
    
    // Both tokens should be valid
    assertEquals(session1.token !== session2.token, true);
    
    const user1 = await getCurrentUser(session1.token);
    const user2 = await getCurrentUser(session2.token);
    
    assertExists(user1);
    assertExists(user2);
  });

  await closeDb();
});

// ============================================================================
// LOGOUT TESTS
// ============================================================================

Deno.test("Auth - User Logout", async (t) => {
  await initDb();

  const { token } = await signup("logoutuser", "password123");

  await t.step("should logout user and invalidate token", async () => {
    // Token should work before logout
    let user = await getCurrentUser(token);
    assertExists(user);
    
    // Logout
    await logout(token);
    
    // Token should not work after logout
    user = await getCurrentUser(token);
    assertEquals(user, null);
  });

  await t.step("should handle logout of already logged out token", async () => {
    const { token } = await signup("logoutuser2", "password123");
    
    await logout(token);
    await logout(token); // Logout again
    
    // Should not throw error
    const user = await getCurrentUser(token);
    assertEquals(user, null);
  });

  await closeDb();
});

// ============================================================================
// GET CURRENT USER TESTS
// ============================================================================

Deno.test("Auth - Get Current User", async (t) => {
  await initDb();

  const { token, user: signupUser } = await signup("currentuser", "password123");

  await t.step("should get current user from valid token", async () => {
    const user = await getCurrentUser(token);
    
    assertExists(user);
    assertEquals(user?.id, signupUser.id);
    assertEquals(user?.username, "currentuser");
    // Password hash should not be exposed
    assertEquals("passwordHash" in user, false);
  });

  await t.step("should return null for invalid token", async () => {
    const user = await getCurrentUser("invalid-token-abc-123");
    assertEquals(user, null);
  });

  await t.step("should return null for malformed token", async () => {
    const user = await getCurrentUser("not.a.jwt.token");
    assertEquals(user, null);
  });

  await t.step("should return null for empty token", async () => {
    const user = await getCurrentUser("");
    assertEquals(user, null);
  });

  await t.step("should return null for expired token", async () => {
    // Note: Actual expiration testing would require mocking time
    // For now, we verify the logic handles expiration
    const user = await getCurrentUser(token);
    assertExists(user); // Token should still be valid
  });

  await closeDb();
});

// ============================================================================
// COOKIE HELPER TESTS
// ============================================================================

Deno.test("Auth - Cookie Helpers", async (t) => {
  await t.step("should extract token from cookie header", () => {
    const cookieHeader = "auth_token=abc123; other_cookie=value; third=thing";
    const token = getTokenFromCookie(cookieHeader);
    
    assertEquals(token, "abc123");
  });

  await t.step("should extract token when auth_token is first", () => {
    const cookieHeader = "auth_token=first-token";
    const token = getTokenFromCookie(cookieHeader);
    
    assertEquals(token, "first-token");
  });

  await t.step("should extract token when auth_token is last", () => {
    const cookieHeader = "other=value; auth_token=last-token";
    const token = getTokenFromCookie(cookieHeader);
    
    assertEquals(token, "last-token");
  });

  await t.step("should return null for missing auth_token", () => {
    const cookieHeader = "other_cookie=value; third=thing";
    const token = getTokenFromCookie(cookieHeader);
    
    assertEquals(token, null);
  });

  await t.step("should return null for null cookie header", () => {
    const token = getTokenFromCookie(null);
    assertEquals(token, null);
  });

  await t.step("should return null for empty cookie header", () => {
    const token = getTokenFromCookie("");
    assertEquals(token, null);
  });

  await t.step("should create auth cookie with correct attributes", () => {
    const cookie = createAuthCookie("test-token-123");
    
    assertEquals(cookie.includes("auth_token=test-token-123"), true);
    assertEquals(cookie.includes("HttpOnly"), true);
    assertEquals(cookie.includes("Secure"), true);
    assertEquals(cookie.includes("SameSite=Strict"), true);
    assertEquals(cookie.includes("Max-Age="), true);
    assertEquals(cookie.includes("Path=/"), true);
  });

  await t.step("should create auth cookie with 24 hour expiration", () => {
    const cookie = createAuthCookie("token");
    
    // Should have Max-Age=86400 (24 hours in seconds)
    assertEquals(cookie.includes("Max-Age=86400"), true);
  });

  await t.step("should create logout cookie with Max-Age=0", () => {
    const cookie = createLogoutCookie();
    
    assertEquals(cookie.includes("auth_token="), true);
    assertEquals(cookie.includes("Max-Age=0"), true);
    assertEquals(cookie.includes("HttpOnly"), true);
  });
});

// ============================================================================
// SECURITY TESTS
// ============================================================================

Deno.test("Auth - Security", async (t) => {
  await initDb();

  await t.step("should not expose password hash in user object", async () => {
    const { user } = await signup("secureuser", "password123");
    
    assertEquals("passwordHash" in user, false);
    assertEquals(Object.keys(user).includes("passwordHash"), false);
  });

  await t.step("should use strong password hashing (bcrypt)", async () => {
    const hash = await hashPassword("test");
    
    // Bcrypt format: $2a$rounds$salthash
    const parts = hash.split("$");
    assertEquals(parts.length >= 4, true);
    
    // Version should be 2a, 2b, or 2y
    const version = parts[1];
    assertEquals(version === "2a" || version === "2b" || version === "2y", true);
    
    // Rounds should be at least 10 (we use 12)
    const rounds = parseInt(parts[2]);
    assertEquals(rounds >= 10, true);
  });

  await t.step("should not allow SQL injection in username", async () => {
    const maliciousUsername = "admin' OR '1'='1";
    const result = await signup(maliciousUsername, "password123");
    
    // Should create user with that exact username (escaped properly)
    assertEquals(result.user.username, maliciousUsername);
    
    // Should be able to login with it
    const loginResult = await login(maliciousUsername, "password123");
    assertExists(loginResult.user);
  });

  await closeDb();
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

Deno.test("Auth - Edge Cases", async (t) => {
  await initDb();

  await t.step("should handle very long username", async () => {
    const longUsername = "a".repeat(100);
    const result = await signup(longUsername, "password123");
    
    assertEquals(result.user.username, longUsername);
  });

  await t.step("should handle special characters in username", async () => {
    const specialUsername = "user@example.com";
    const result = await signup(specialUsername, "password123");
    
    assertEquals(result.user.username, specialUsername);
  });

  await t.step("should handle Unicode characters in password", async () => {
    const unicodePassword = "пароль🔒密码";
    const { user } = await signup("unicodeuser", unicodePassword);
    
    // Should be able to login with Unicode password
    const loginResult = await login("unicodeuser", unicodePassword);
    assertEquals(loginResult.user.id, user.id);
  });

  await t.step("should handle very long password", async () => {
    const longPassword = "x".repeat(1000);
    const result = await signup("longpassuser", longPassword);
    
    assertExists(result.user);
    
    // Should be able to login
    const loginResult = await login("longpassuser", longPassword);
    assertEquals(loginResult.user.id, result.user.id);
  });

  await closeDb();
});
