# 🚀 Phase 1 Execution Plan - Foundation

**Status:** Ready to Execute  
**Duration:** 2 weeks  
**Approach:** TDD (Test-Driven Development)  
**Repository:** New repo (darobbins85/darvis-web)

---

## 📋 Pre-Execution Checklist

### Prerequisites (User Action Required)

- [ ] **Install Deno**
  ```bash
  curl -fsSL https://deno.land/install.sh | sh
  # Add to PATH (add to ~/.bashrc or ~/.zshrc):
  export PATH="$HOME/.deno/bin:$PATH"
  # Verify installation:
  deno --version
  ```

- [ ] **Verify Rust Installation** (already installed: /usr/bin/rustc)
  ```bash
  rustc --version
  cargo --version
  # If cargo not found, install via:
  # curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```

- [ ] **Stash Current Python Changes**
  ```bash
  cd /home/david/Code/github/darobbins85/darvis
  git stash save "WIP: Python changes before TypeScript migration"
  ```

- [ ] **Create GitHub Repository**
  - Go to https://github.com/new
  - Repository name: `darvis-web`
  - Description: "Darvis Voice Assistant - Modern TypeScript/Deno Web App"
  - Public or Private: (your choice)
  - ✅ Add README
  - ✅ Add .gitignore (Node template, we'll customize)
  - ✅ Choose license (MIT recommended, to match current)
  - Click "Create repository"

---

## 📁 Phase 1 Tasks (Detailed)

### Task 1: Repository Setup (30 minutes)

**Goal:** Create new repository with proper structure

**Steps:**
```bash
# Clone the new empty repository
cd /home/david/Code/github/darobbins85/
git clone https://github.com/darobbins85/darvis-web.git
cd darvis-web

# Create directory structure
mkdir -p {web,desktop,shared,config,tests,scripts,docs}
mkdir -p web/{routes,islands,components,lib,static,types}
mkdir -p web/routes/api
mkdir -p web/static/styles
mkdir -p tests/{unit,integration,e2e,visual}
mkdir -p desktop/src-tauri/src
mkdir -p docs

# Copy migration plan from old repo
cp /home/david/Code/github/darobbins85/darvis/.opencode/plans/*.md docs/

# Copy assets
cp -r /home/david/Code/github/darobbins85/darvis/assets .
```

**Deliverable:** Clean repo structure matching the plan

---

### Task 2: Deno Configuration (30 minutes)

**Goal:** Set up Deno workspace and dependencies

**Files to Create:**

#### `deno.json` (root)
```json
{
  "workspace": ["./web"],
  "tasks": {
    "dev": "cd web && deno task dev",
    "dev:all": "deno task dev & cd desktop && npm run tauri dev",
    "test": "deno test --allow-all tests/",
    "test:coverage": "deno test --allow-all --coverage=coverage tests/",
    "test:watch": "deno test --allow-all --watch tests/",
    "fmt": "deno fmt",
    "lint": "deno lint",
    "build": "cd web && deno task build",
    "deploy": "cd web && deployctl deploy --project=darvis-web main.ts"
  },
  "fmt": {
    "useTabs": false,
    "lineWidth": 100,
    "indentWidth": 2,
    "semiColons": true,
    "singleQuote": false,
    "proseWrap": "preserve"
  },
  "lint": {
    "rules": {
      "tags": ["recommended"]
    }
  }
}
```

#### `web/deno.json`
```json
{
  "tasks": {
    "dev": "deno run -A --watch=static/,routes/ dev.ts",
    "build": "deno run -A build.ts",
    "preview": "deno run -A main.ts",
    "update": "deno run -A -r https://fresh.deno.dev/update ."
  },
  "imports": {
    "$fresh/": "https://deno.land/x/fresh@1.6.1/",
    "preact": "https://esm.sh/preact@10.19.2",
    "preact/": "https://esm.sh/preact@10.19.2/",
    "@preact/signals": "https://esm.sh/*@preact/signals@1.2.1",
    "@preact/signals-core": "https://esm.sh/*@preact/signals-core@1.5.0",
    "tailwindcss": "npm:tailwindcss@3.4.0",
    "tailwindcss/": "npm:/tailwindcss@3.4.0/",
    "tailwindcss/plugin": "npm:/tailwindcss@3.4.0/plugin.js",
    "$std/": "https://deno.land/std@0.208.0/",
    "bcrypt": "https://deno.land/x/bcrypt@v0.4.1/mod.ts",
    "djwt": "https://deno.land/x/djwt@v3.0.1/mod.ts",
    "socket.io": "https://esm.sh/socket.io@4.6.1",
    "socket.io-client": "https://esm.sh/socket.io-client@4.6.1"
  },
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

#### `.gitignore`
```
# Deno
.deno/
deno.lock

# Fresh build
_fresh/
static/_fresh/

# Coverage
coverage/

# Logs
*.log
logs/

# Environment
.env
.env.local

# OS
.DS_Store
Thumbs.db
*.swp
*.swo

# IDE
.vscode/
.idea/
*.sublime-*

# Build artifacts
dist/
build/

# Dependencies
node_modules/

# Testing
playwright-report/
test-results/

# Deno KV (local development)
*.db
*.sqlite

# Tauri
desktop/src-tauri/target/
desktop/src-tauri/Cargo.lock
```

#### `.env.example`
```bash
# Server Configuration
PORT=8000
DENO_ENV=development

# Authentication
JWT_SECRET=your-secret-here-generate-with-crypto-randomUUID

# Database (auto-configured on Deno Deploy)
DENO_KV_URL=

# OpenCode Integration
OPENCODE_PATH=/home/david/.opencode/bin/opencode

# CORS
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:3000

# Logging
LOG_LEVEL=DEBUG
```

**Tests to Write:**
- ✅ `tests/unit/config.test.ts` - Test config loading from .env

**Deliverable:** Working Deno configuration with proper TypeScript strict mode

---

### Task 3: Fresh Framework Setup (1 hour)

**Goal:** Initialize Fresh with Tailwind CSS

**Steps:**
```bash
cd web
deno run -A -r https://fresh.deno.dev
# Choose: 
# - Use Tailwind CSS? Yes
# - Use VS Code? (your preference)
# - Setup twind for styling? No (we're using Tailwind)
```

**Manual Configuration:**

#### `web/fresh.config.ts`
```typescript
import { defineConfig } from "$fresh/server.ts";
import tailwind from "$fresh/plugins/tailwind.ts";

export default defineConfig({
  plugins: [tailwind()],
});
```

#### `web/tailwind.config.ts`
```typescript
import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f1419',
        surface: '#1a1f29',
        primary: '#00d4aa',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        'text-primary': '#f9fafb',
        'text-secondary': '#9ca3af',
      },
    },
  },
} satisfies Config;
```

#### `web/static/styles/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-background text-text-primary;
  }
}
```

**Tests to Write:**
- ✅ `tests/e2e/app-loads.test.ts` - Test that Fresh app starts and responds

**Deliverable:** Fresh app running on http://localhost:8000 with Tailwind

---

### Task 4: Deno KV Database Setup (2 hours)

**Goal:** Create database abstraction layer with Deno KV

**Files to Create:**

#### `web/lib/db.ts`
```typescript
/**
 * Deno KV Database Layer
 * 
 * Provides type-safe access to Deno KV database.
 * Schema documentation in docs/TECHNICAL_SPECS.md
 */

import type { User, Session, Message, AuthSession } from "../types/index.ts";

let kv: Deno.Kv;

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
 * Get all sessions for a user
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
 * Delete session and all its messages
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  const session = await getSessionById(sessionId);
  if (!session) return false;

  // Delete all messages
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

  await kv.set(["message", sessionId, messageId], message);

  // Update session timestamp
  const session = await getSessionById(sessionId);
  if (session) {
    session.updatedAt = new Date();
    await kv.set(["session", sessionId], session);
  }

  return message;
}

/**
 * Get all messages for a session
 */
export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  const messages: Message[] = [];
  const iter = kv.list<Message>({ prefix: ["message", sessionId] });

  for await (const entry of iter) {
    messages.push(entry.value);
  }

  return messages.sort((a, b) => 
    a.createdAt.getTime() - b.createdAt.getTime()
  );
}

// ============================================================================
// AUTH SESSION OPERATIONS
// ============================================================================

/**
 * Create auth session
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
 */
export async function getAuthSession(token: string): Promise<AuthSession | null> {
  const result = await kv.get<AuthSession>(["auth_session", token]);
  
  if (!result.value) return null;
  
  // Check expiration
  if (result.value.expiresAt < new Date()) {
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
```

#### `web/types/index.ts`
```typescript
export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  name: string;
  aiSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface AuthSession {
  token: string;
  userId: string;
  expiresAt: Date;
}
```

**Tests to Write (TDD - Write these FIRST):**

#### `tests/unit/db.test.ts`
```typescript
import { assertEquals, assertExists, assertRejects } from "$std/assert/mod.ts";
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
  deleteSession,
  addMessage,
  getSessionMessages,
  createAuthSession,
  getAuthSession,
  deleteAuthSession,
} from "../../web/lib/db.ts";

// Setup and teardown
Deno.test("Database Setup", async (t) => {
  await initDb();

  await t.step("should initialize database", async () => {
    // Just verify no error thrown
    assertExists(await getUserByUsername("nonexistent"));
  });

  await closeDb();
});

Deno.test("User Operations", async (t) => {
  await initDb();

  await t.step("should create user", async () => {
    const user = await createUser("testuser", "hashedpassword");
    assertExists(user.id);
    assertEquals(user.username, "testuser");
  });

  await t.step("should not create duplicate username", async () => {
    await assertRejects(
      async () => await createUser("testuser", "hashedpassword"),
      Error,
      "Username already exists"
    );
  });

  await t.step("should get user by username", async () => {
    const user = await getUserByUsername("testuser");
    assertExists(user);
    assertEquals(user.username, "testuser");
  });

  await t.step("should get user by ID", async () => {
    const user = await getUserByUsername("testuser");
    const userById = await getUserById(user!.id);
    assertEquals(userById?.username, "testuser");
  });

  await closeDb();
});

Deno.test("Session Operations", async (t) => {
  await initDb();

  // Create test user
  const user = await createUser("sessionuser", "hashedpassword");

  await t.step("should create session", async () => {
    const session = await createSession(user.id, "Test Session");
    assertExists(session.id);
    assertEquals(session.name, "Test Session");
    assertEquals(session.userId, user.id);
  });

  await t.step("should get user sessions", async () => {
    const sessions = await getUserSessions(user.id);
    assertEquals(sessions.length, 1);
    assertEquals(sessions[0].name, "Test Session");
  });

  await t.step("should update session name", async () => {
    const sessions = await getUserSessions(user.id);
    const updated = await updateSessionName(sessions[0].id, "Renamed Session");
    assertEquals(updated?.name, "Renamed Session");
  });

  await t.step("should delete session", async () => {
    const sessions = await getUserSessions(user.id);
    const deleted = await deleteSession(sessions[0].id);
    assertEquals(deleted, true);
    
    const remainingSessions = await getUserSessions(user.id);
    assertEquals(remainingSessions.length, 0);
  });

  await closeDb();
});

Deno.test("Message Operations", async (t) => {
  await initDb();

  // Create test user and session
  const user = await createUser("messageuser", "hashedpassword");
  const session = await createSession(user.id, "Message Test");

  await t.step("should add message", async () => {
    const message = await addMessage(session.id, "user", "Hello");
    assertExists(message.id);
    assertEquals(message.content, "Hello");
    assertEquals(message.role, "user");
  });

  await t.step("should get session messages", async () => {
    await addMessage(session.id, "assistant", "Hi there!");
    const messages = await getSessionMessages(session.id);
    assertEquals(messages.length, 2);
    assertEquals(messages[0].content, "Hello");
    assertEquals(messages[1].content, "Hi there!");
  });

  await closeDb();
});

Deno.test("Auth Session Operations", async (t) => {
  await initDb();

  const token = "test-token-123";
  const userId = "user-123";

  await t.step("should create auth session", async () => {
    const authSession = await createAuthSession(token, userId);
    assertEquals(authSession.token, token);
    assertEquals(authSession.userId, userId);
  });

  await t.step("should get auth session", async () => {
    const authSession = await getAuthSession(token);
    assertExists(authSession);
    assertEquals(authSession.userId, userId);
  });

  await t.step("should delete auth session", async () => {
    await deleteAuthSession(token);
    const authSession = await getAuthSession(token);
    assertEquals(authSession, null);
  });

  await closeDb();
});
```

**Command to run tests:**
```bash
deno task test
```

**Deliverable:** Working Deno KV database layer with 100% test coverage

---

### Task 5: Authentication System (3 hours)

**Goal:** Implement JWT-based authentication with bcrypt password hashing

**Files to Create:**

#### `web/lib/auth.ts`
```typescript
/**
 * Authentication Service
 * 
 * Handles user signup, login, and session management
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
import type { User } from "../types/index.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET");

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// Import key for JWT signing
const key = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(JWT_SECRET),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Create JWT token
 */
async function createToken(userId: string): Promise<string> {
  return await create(
    { alg: "HS256", typ: "JWT" },
    { userId, exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) }, // 24 hours
    key
  );
}

/**
 * Verify JWT token and return user ID
 */
async function verifyToken(token: string): Promise<string | null> {
  try {
    const payload = await verify(token, key);
    return payload.userId as string;
  } catch {
    return null;
  }
}

/**
 * Sign up new user
 */
export async function signup(
  username: string,
  password: string
): Promise<{ user: User; token: string }> {
  // Validate input
  if (username.length < 3) {
    throw new Error("Username must be at least 3 characters");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await createUser(username, passwordHash);

  // Create JWT token
  const token = await createToken(user.id);

  // Create auth session
  await createAuthSession(token, user.id);

  return { user, token };
}

/**
 * Login existing user
 */
export async function login(
  username: string,
  password: string
): Promise<{ user: User; token: string }> {
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

  return { user, token };
}

/**
 * Logout user
 */
export async function logout(token: string): Promise<void> {
  await deleteAuthSession(token);
}

/**
 * Get current user from token
 */
export async function getCurrentUser(token: string): Promise<User | null> {
  // Verify token
  const userId = await verifyToken(token);
  if (!userId) return null;

  // Check auth session exists and is valid
  const authSession = await getAuthSession(token);
  if (!authSession) return null;

  // Get user
  return await getUserById(userId);
}

/**
 * Extract token from cookie header
 */
export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const authCookie = cookies.find((c) => c.startsWith("auth_token="));

  if (!authCookie) return null;

  return authCookie.split("=")[1];
}

/**
 * Create auth cookie header
 */
export function createAuthCookie(token: string): string {
  return `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${24 * 60 * 60}; Path=/`;
}

/**
 * Create logout cookie header (expires immediately)
 */
export function createLogoutCookie(): string {
  return "auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/";
}
```

**Tests to Write (TDD):**

#### `tests/unit/auth.test.ts`
```typescript
import { assertEquals, assertExists, assertRejects } from "$std/assert/mod.ts";
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
import { initDb, closeDb } from "../../web/lib/db.ts";

// Set JWT_SECRET for testing
Deno.env.set("JWT_SECRET", "test-secret-key-for-testing");

Deno.test("Password Hashing", async (t) => {
  await t.step("should hash password", async () => {
    const hash = await hashPassword("password123");
    assertExists(hash);
    assertEquals(hash.startsWith("$2a$"), true);
  });

  await t.step("should verify correct password", async () => {
    const hash = await hashPassword("password123");
    const isValid = await verifyPassword("password123", hash);
    assertEquals(isValid, true);
  });

  await t.step("should reject incorrect password", async () => {
    const hash = await hashPassword("password123");
    const isValid = await verifyPassword("wrongpassword", hash);
    assertEquals(isValid, false);
  });
});

Deno.test("User Signup", async (t) => {
  await initDb();

  await t.step("should signup new user", async () => {
    const result = await signup("newuser", "password123");
    assertExists(result.user.id);
    assertEquals(result.user.username, "newuser");
    assertExists(result.token);
  });

  await t.step("should reject short username", async () => {
    await assertRejects(
      async () => await signup("ab", "password123"),
      Error,
      "Username must be at least 3 characters"
    );
  });

  await t.step("should reject short password", async () => {
    await assertRejects(
      async () => await signup("validuser", "12345"),
      Error,
      "Password must be at least 6 characters"
    );
  });

  await closeDb();
});

Deno.test("User Login", async (t) => {
  await initDb();

  // Create test user
  await signup("loginuser", "password123");

  await t.step("should login with correct credentials", async () => {
    const result = await login("loginuser", "password123");
    assertExists(result.token);
    assertEquals(result.user.username, "loginuser");
  });

  await t.step("should reject wrong password", async () => {
    await assertRejects(
      async () => await login("loginuser", "wrongpassword"),
      Error,
      "Invalid username or password"
    );
  });

  await t.step("should reject nonexistent user", async () => {
    await assertRejects(
      async () => await login("nonexistent", "password123"),
      Error,
      "Invalid username or password"
    );
  });

  await closeDb();
});

Deno.test("User Logout", async (t) => {
  await initDb();

  const { token } = await signup("logoutuser", "password123");

  await t.step("should logout user", async () => {
    await logout(token);
    const user = await getCurrentUser(token);
    assertEquals(user, null);
  });

  await closeDb();
});

Deno.test("Get Current User", async (t) => {
  await initDb();

  const { token, user } = await signup("currentuser", "password123");

  await t.step("should get current user from token", async () => {
    const currentUser = await getCurrentUser(token);
    assertEquals(currentUser?.id, user.id);
    assertEquals(currentUser?.username, "currentuser");
  });

  await t.step("should return null for invalid token", async () => {
    const currentUser = await getCurrentUser("invalid-token");
    assertEquals(currentUser, null);
  });

  await closeDb();
});

Deno.test("Cookie Helpers", async (t) => {
  await t.step("should extract token from cookie header", () => {
    const cookieHeader = "auth_token=abc123; other=value";
    const token = getTokenFromCookie(cookieHeader);
    assertEquals(token, "abc123");
  });

  await t.step("should return null for missing cookie", () => {
    const token = getTokenFromCookie(null);
    assertEquals(token, null);
  });

  await t.step("should create auth cookie", () => {
    const cookie = createAuthCookie("abc123");
    assertEquals(cookie.includes("auth_token=abc123"), true);
    assertEquals(cookie.includes("HttpOnly"), true);
  });

  await t.step("should create logout cookie", () => {
    const cookie = createLogoutCookie();
    assertEquals(cookie.includes("Max-Age=0"), true);
  });
});
```

**Deliverable:** Authentication system with 100% test coverage

---

### Task 6: API Routes (2 hours)

(Continuing in next response due to length limit...)

Would you like me to continue with Task 6 (API Routes), Task 7 (Testing Infrastructure), and Task 8 (CI/CD)? This will complete the Phase 1 execution plan.
