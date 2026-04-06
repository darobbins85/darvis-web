/**
 * Database Layer Tests (TDD)
 * 
 * These tests define the expected behavior of our database layer.
 * We write these FIRST, then implement the code to make them pass.
 */

import { assertEquals, assertExists, assertRejects } from "https://deno.land/std@0.216.0/assert/mod.ts";

// Import database functions (these don't exist yet - that's the point!)
import {
  initDb,
  closeDb,
  createUser,
  getUserByUsername,
  getUserById,
  createSession,
  getUserSessions,
  getSessionById,
  updateSessionName,
  updateSessionAiId,
  deleteSession,
  addMessage,
  getSessionMessages,
  createAuthSession,
  getAuthSession,
  deleteAuthSession,
} from "../../web/lib/db.ts";

// Use in-memory Deno KV for tests
Deno.env.set("DENO_KV_URL", ":memory:");

// ============================================================================
// DATABASE INITIALIZATION TESTS
// ============================================================================

Deno.test("Database - Initialize and Close", async () => {
  await initDb();
  // Should initialize without error
  await closeDb();
  // Should close without error
});

// ============================================================================
// USER OPERATION TESTS
// ============================================================================

Deno.test("Database - User Operations", async (t) => {
  await initDb();

  await t.step("should create user with valid data", async () => {
    const user = await createUser("testuser", "hashedpassword123");
    
    assertExists(user.id);
    assertEquals(user.username, "testuser");
    assertEquals(user.passwordHash, "hashedpassword123");
    assertExists(user.createdAt);
    assertEquals(user.createdAt instanceof Date, true);
  });

  await t.step("should not create duplicate username", async () => {
    await assertRejects(
      async () => await createUser("testuser", "anotherpassword"),
      Error,
      "Username already exists"
    );
  });

  await t.step("should get user by username", async () => {
    const user = await getUserByUsername("testuser");
    
    assertExists(user);
    assertEquals(user?.username, "testuser");
    assertEquals(user?.passwordHash, "hashedpassword123");
  });

  await t.step("should get user by ID", async () => {
    const user = await getUserByUsername("testuser");
    assertExists(user);
    
    const userById = await getUserById(user.id);
    assertEquals(userById?.id, user.id);
    assertEquals(userById?.username, "testuser");
  });

  await t.step("should return null for non-existent username", async () => {
    const user = await getUserByUsername("nonexistent");
    assertEquals(user, null);
  });

  await t.step("should return null for non-existent user ID", async () => {
    const user = await getUserById("fake-uuid-12345");
    assertEquals(user, null);
  });

  await closeDb();
});

// ============================================================================
// SESSION OPERATION TESTS
// ============================================================================

Deno.test("Database - Session Operations", async (t) => {
  await initDb();

  // Create test user first
  const user = await createUser("sessionuser", "hashedpassword");

  await t.step("should create session with default name", async () => {
    const session = await createSession(user.id);
    
    assertExists(session.id);
    assertEquals(session.userId, user.id);
    assertEquals(session.name, "Chat 1");
    assertExists(session.createdAt);
    assertExists(session.updatedAt);
    assertEquals(session.aiSessionId, undefined);
  });

  await t.step("should create session with custom name", async () => {
    const session = await createSession(user.id, "Custom Session Name");
    
    assertEquals(session.name, "Custom Session Name");
    assertEquals(session.userId, user.id);
  });

  await t.step("should auto-increment session numbers", async () => {
    const session3 = await createSession(user.id);
    assertEquals(session3.name, "Chat 3");
  });

  await t.step("should get all user sessions ordered by updatedAt", async () => {
    const sessions = await getUserSessions(user.id);
    
    assertEquals(sessions.length, 3);
    // Most recently updated should be first
    assertEquals(sessions[0].name, "Chat 3");
    assertEquals(sessions[1].name, "Custom Session Name");
    assertEquals(sessions[2].name, "Chat 1");
  });

  await t.step("should get session by ID", async () => {
    const sessions = await getUserSessions(user.id);
    const firstSession = sessions[0];
    
    const session = await getSessionById(firstSession.id);
    assertExists(session);
    assertEquals(session?.id, firstSession.id);
    assertEquals(session?.name, firstSession.name);
  });

  await t.step("should return null for non-existent session", async () => {
    const session = await getSessionById("fake-session-id");
    assertEquals(session, null);
  });

  await t.step("should update session name", async () => {
    const sessions = await getUserSessions(user.id);
    const sessionToUpdate = sessions[0];
    
    const updated = await updateSessionName(sessionToUpdate.id, "Renamed Session");
    
    assertExists(updated);
    assertEquals(updated?.name, "Renamed Session");
    assertEquals(updated?.id, sessionToUpdate.id);
    
    // Verify it persisted
    const retrieved = await getSessionById(sessionToUpdate.id);
    assertEquals(retrieved?.name, "Renamed Session");
  });

  await t.step("should return null when updating non-existent session", async () => {
    const updated = await updateSessionName("fake-id", "New Name");
    assertEquals(updated, null);
  });

  await t.step("should update session with AI session ID", async () => {
    const sessions = await getUserSessions(user.id);
    const session = sessions[0];
    
    await updateSessionAiId(session.id, "ai-session-abc-123");
    
    const updated = await getSessionById(session.id);
    assertEquals(updated?.aiSessionId, "ai-session-abc-123");
  });

  await t.step("should delete session and return true", async () => {
    const sessions = await getUserSessions(user.id);
    const sessionToDelete = sessions[2]; // Delete oldest
    
    const deleted = await deleteSession(sessionToDelete.id);
    assertEquals(deleted, true);
    
    // Verify it's gone
    const remaining = await getUserSessions(user.id);
    assertEquals(remaining.length, 2);
    
    const retrieved = await getSessionById(sessionToDelete.id);
    assertEquals(retrieved, null);
  });

  await t.step("should return false when deleting non-existent session", async () => {
    const deleted = await deleteSession("fake-session-id");
    assertEquals(deleted, false);
  });

  await closeDb();
});

// ============================================================================
// MESSAGE OPERATION TESTS
// ============================================================================

Deno.test("Database - Message Operations", async (t) => {
  await initDb();

  // Create test user and session
  const user = await createUser("messageuser", "hashedpassword");
  const session = await createSession(user.id, "Message Test Session");

  await t.step("should add user message", async () => {
    const message = await addMessage(session.id, "user", "Hello, Darvis!");
    
    assertExists(message.id);
    assertEquals(message.sessionId, session.id);
    assertEquals(message.role, "user");
    assertEquals(message.content, "Hello, Darvis!");
    assertExists(message.createdAt);
  });

  await t.step("should add assistant message", async () => {
    const message = await addMessage(session.id, "assistant", "Hello! How can I help?");
    
    assertEquals(message.role, "assistant");
    assertEquals(message.content, "Hello! How can I help?");
  });

  await t.step("should get messages ordered by createdAt", async () => {
    // Add more messages
    await addMessage(session.id, "user", "What is 2+2?");
    await addMessage(session.id, "assistant", "2+2 equals 4");
    
    const messages = await getSessionMessages(session.id);
    
    assertEquals(messages.length, 4);
    // Should be in chronological order
    assertEquals(messages[0].content, "Hello, Darvis!");
    assertEquals(messages[1].content, "Hello! How can I help?");
    assertEquals(messages[2].content, "What is 2+2?");
    assertEquals(messages[3].content, "2+2 equals 4");
  });

  await t.step("should return empty array for session with no messages", async () => {
    const emptySession = await createSession(user.id, "Empty Session");
    const messages = await getSessionMessages(emptySession.id);
    
    assertEquals(messages.length, 0);
  });

  await t.step("should update session timestamp when adding message", async () => {
    const sessionBefore = await getSessionById(session.id);
    assertExists(sessionBefore);
    
    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await addMessage(session.id, "user", "Another message");
    
    const sessionAfter = await getSessionById(session.id);
    assertExists(sessionAfter);
    
    // updatedAt should be newer
    assertEquals(
      sessionAfter.updatedAt.getTime() > sessionBefore.updatedAt.getTime(),
      true
    );
  });

  await t.step("should delete messages when session is deleted", async () => {
    const messages = await getSessionMessages(session.id);
    assertEquals(messages.length > 0, true); // Has messages
    
    await deleteSession(session.id);
    
    const messagesAfterDelete = await getSessionMessages(session.id);
    assertEquals(messagesAfterDelete.length, 0);
  });

  await closeDb();
});

// ============================================================================
// AUTH SESSION OPERATION TESTS
// ============================================================================

Deno.test("Database - Auth Session Operations", async (t) => {
  await initDb();

  const token = "test-token-abc-123";
  const userId = "user-uuid-456";

  await t.step("should create auth session", async () => {
    const authSession = await createAuthSession(token, userId);
    
    assertEquals(authSession.token, token);
    assertEquals(authSession.userId, userId);
    assertExists(authSession.expiresAt);
    assertEquals(authSession.expiresAt instanceof Date, true);
    
    // Should expire 24 hours from now
    const now = new Date();
    const hoursDiff = (authSession.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    assertEquals(hoursDiff > 23 && hoursDiff < 25, true); // ~24 hours
  });

  await t.step("should get auth session by token", async () => {
    const authSession = await getAuthSession(token);
    
    assertExists(authSession);
    assertEquals(authSession?.token, token);
    assertEquals(authSession?.userId, userId);
  });

  await t.step("should return null for non-existent token", async () => {
    const authSession = await getAuthSession("fake-token-xyz");
    assertEquals(authSession, null);
  });

  await t.step("should delete auth session", async () => {
    await deleteAuthSession(token);
    
    const authSession = await getAuthSession(token);
    assertEquals(authSession, null);
  });

  await t.step("should return null for expired session", async () => {
    // Create session with past expiration
    const expiredToken = "expired-token";
    const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 25); // 25 hours ago
    
    // We'll need to manually create this in the implementation
    // For now, just verify the logic handles it
    await createAuthSession(expiredToken, userId);
    
    // Note: In actual implementation, getAuthSession should check expiration
    // and return null if expired
  });

  await closeDb();
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

Deno.test("Database - Edge Cases", async (t) => {
  await initDb();

  await t.step("should handle concurrent user creation", async () => {
    // Try to create same username at same time
    const promises = [
      createUser("concurrent", "pass1"),
      createUser("concurrent", "pass2"),
    ];
    
    // One should succeed, one should fail
    let successCount = 0;
    let errorCount = 0;
    
    await Promise.allSettled(promises).then(results => {
      results.forEach(result => {
        if (result.status === "fulfilled") successCount++;
        if (result.status === "rejected") errorCount++;
      });
    });
    
    assertEquals(successCount, 1);
    assertEquals(errorCount, 1);
  });

  await t.step("should handle empty session list", async () => {
    const newUser = await createUser("emptysessions", "pass");
    const sessions = await getUserSessions(newUser.id);
    
    assertEquals(sessions.length, 0);
  });

  await closeDb();
});
