/**
 * Deno KV Database Layer
 * 
 * Provides type-safe access to Deno KV database with CRUD operations
 * for users, sessions, messages, and auth sessions.
 * 
 * Schema:
 * - ["user", userId] -> User
 * - ["user_by_username", username] -> userId
 * - ["session", sessionId] -> Session
 * - ["user_sessions", userId, sessionId] -> null (index)
 * - ["message", sessionId, messageId] -> Message
 * - ["auth_session", token] -> AuthSession
 */

import type { User, Session, Message, AuthSession } from "../types/index.ts";

let kv: Deno.Kv;

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

/**
 * Initialize database connection
 */
export async function initDb(): Promise<void> {
  const kvUrl = Deno.env.get("DENO_KV_URL");
  kv = await Deno.openKv(kvUrl);
  console.log("✅ Database connected");
}

/**
 * Get database instance (for advanced queries)
 */
export function getDb(): Deno.Kv {
  if (!kv) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  return kv;
}

/**
 * Close database connection
 */
export async function closeDb(): Promise<void> {
  if (kv) {
    kv.close();
  }
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

/**
 * Create a new user
 * 
 * @throws Error if username already exists
 */
export async function createUser(
  username: string,
  passwordHash: string
): Promise<User> {
  const userId = crypto.randomUUID();
  const user: User = {
    id: userId,
    username,
    passwordHash,
    createdAt: new Date(),
  };

  // Atomic operation: only create if username doesn't exist
  const result = await kv.atomic()
    .check({ key: ["user_by_username", username], versionstamp: null })
    .set(["user", userId], user)
    .set(["user_by_username", username], userId)
    .commit();

  if (!result.ok) {
    throw new Error("Username already exists");
  }

  return user;
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await kv.get<string>(["user_by_username", username]);
  if (!result.value) return null;

  const userId = result.value;
  const userResult = await kv.get<User>(["user", userId]);
  return userResult.value;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const result = await kv.get<User>(["user", userId]);
  return result.value;
}

// ============================================================================
// SESSION OPERATIONS
// ============================================================================

/**
 * Create a new session
 * Auto-numbers sessions (Chat 1, Chat 2, etc.) if no name provided
 */
export async function createSession(
  userId: string,
  name?: string
): Promise<Session> {
  const sessionId = crypto.randomUUID();
  const sessionNumber = await getNextSessionNumber(userId);
  
  const session: Session = {
    id: sessionId,
    userId,
    name: name || `Chat ${sessionNumber}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await kv.atomic()
    .set(["session", sessionId], session)
    .set(["user_sessions", userId, sessionId], null)
    .commit();

  return session;
}

/**
 * Get all sessions for a user, ordered by updatedAt (newest first)
 */
export async function getUserSessions(userId: string): Promise<Session[]> {
  const sessions: Session[] = [];
  const iter = kv.list<null>({ prefix: ["user_sessions", userId] });
  
  for await (const entry of iter) {
    const sessionId = entry.key[2] as string;
    const sessionResult = await kv.get<Session>(["session", sessionId]);
    if (sessionResult.value) {
      sessions.push(sessionResult.value);
    }
  }

  // Sort by updatedAt, newest first
  return sessions.sort((a, b) => 
    b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}

/**
 * Get session by ID
 */
export async function getSessionById(sessionId: string): Promise<Session | null> {
  const result = await kv.get<Session>(["session", sessionId]);
  return result.value;
}

/**
 * Update session name
 */
export async function updateSessionName(
  sessionId: string,
  name: string
): Promise<Session | null> {
  const session = await getSessionById(sessionId);
  if (!session) return null;

  session.name = name;
  session.updatedAt = new Date();

  await kv.set(["session", sessionId], session);
  return session;
}

/**
 * Update session with AI session ID
 */
export async function updateSessionAiId(
  sessionId: string,
  aiSessionId: string
): Promise<void> {
  const session = await getSessionById(sessionId);
  if (!session) return;

  session.aiSessionId = aiSessionId;
  session.updatedAt = new Date();

  await kv.set(["session", sessionId], session);
}

/**
 * Delete session and all its messages
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  const session = await getSessionById(sessionId);
  if (!session) return false;

  // Delete all messages for this session
  const messages = kv.list({ prefix: ["message", sessionId] });
  const operations = kv.atomic();
  
  for await (const msg of messages) {
    operations.delete(msg.key);
  }

  // Delete session and index
  operations.delete(["session", sessionId]);
  operations.delete(["user_sessions", session.userId, sessionId]);

  await operations.commit();
  return true;
}

/**
 * Get next session number for user
 */
async function getNextSessionNumber(userId: string): Promise<number> {
  const sessions = await getUserSessions(userId);
  return sessions.length + 1;
}

// ============================================================================
// MESSAGE OPERATIONS
// ============================================================================

/**
 * Add message to session
 * Also updates session's updatedAt timestamp
 */
export async function addMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string
): Promise<Message> {
  const messageId = crypto.randomUUID();
  const message: Message = {
    id: messageId,
    sessionId,
    role,
    content,
    createdAt: new Date(),
  };

  // Add message and update session timestamp
  const session = await getSessionById(sessionId);
  if (session) {
    session.updatedAt = new Date();
    
    await kv.atomic()
      .set(["message", sessionId, messageId], message)
      .set(["session", sessionId], session)
      .commit();
  } else {
    await kv.set(["message", sessionId, messageId], message);
  }

  return message;
}

/**
 * Get all messages for a session, ordered by createdAt (oldest first)
 */
export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  const messages: Message[] = [];
  const iter = kv.list<Message>({ prefix: ["message", sessionId] });

  for await (const entry of iter) {
    messages.push(entry.value);
  }

  // Sort by createdAt, oldest first (chronological order)
  return messages.sort((a, b) => 
    a.createdAt.getTime() - b.createdAt.getTime()
  );
}

// ============================================================================
// AUTH SESSION OPERATIONS
// ============================================================================

/**
 * Create auth session with 24-hour expiration
 */
export async function createAuthSession(
  token: string,
  userId: string
): Promise<AuthSession> {
  const authSession: AuthSession = {
    token,
    userId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };

  await kv.set(["auth_session", token], authSession);
  return authSession;
}

/**
 * Get auth session by token
 * Returns null if token doesn't exist or is expired
 */
export async function getAuthSession(token: string): Promise<AuthSession | null> {
  const result = await kv.get<AuthSession>(["auth_session", token]);
  
  if (!result.value) return null;
  
  // Check expiration
  if (result.value.expiresAt < new Date()) {
    // Token expired, delete it
    await deleteAuthSession(token);
    return null;
  }

  return result.value;
}

/**
 * Delete auth session (logout)
 */
export async function deleteAuthSession(token: string): Promise<void> {
  await kv.delete(["auth_session", token]);
}
