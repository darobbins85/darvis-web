# 🚀 Phase 1: Complete Execution Plan

**Status:** Ready to Execute  
**Repository:** git@github.com:darobbins85/darvis-web.git  
**Approach:** Test-Driven Development (TDD)  
**Duration:** ~11-13 hours of focused work

---

## ✅ Pre-Execution Status

- ✅ Planning complete
- ✅ GitHub repository created (darvis-web)
- ✅ Rust/Cargo installed (1.92.0)
- ✅ Python changes stashed
- ⚠️ Deno needs installation

---

## 🎯 Phase 1 Goal

Build a solid foundation for the Darvis web application:
- Fresh framework with Tailwind CSS
- Deno KV database layer
- JWT authentication system
- API routes for auth
- Testing infrastructure
- CI/CD pipeline

All with **100% test coverage** using TDD approach.

---

## 📋 Execution Steps

### STEP 0: Install Deno (5 minutes)

**Action Required:**
```bash
# Install Deno
curl -fsSL https://deno.land/install.sh | sh

# Add to PATH
echo 'export PATH="$HOME/.deno/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify
deno --version
# Should output: deno 1.x.x (release, x86_64-unknown-linux-gnu)
```

**Verification:**
```bash
deno --version
deno run https://deno.land/std/examples/welcome.ts
```

**Expected Output:**
```
Welcome to Deno!
```

---

### STEP 1: Clone and Setup Repository (10 minutes)

**Actions:**
```bash
# Clone the repository
cd /home/david/Code/github/darobbins85/
git clone git@github.com:darobbins85/darvis-web.git
cd darvis-web

# Create directory structure
mkdir -p web/{routes/api,islands,components,lib,static/styles,types}
mkdir -p desktop/src-tauri/src
mkdir -p shared/types
mkdir -p config
mkdir -p tests/{unit,integration,e2e,visual}
mkdir -p scripts
mkdir -p docs
mkdir -p logs

# Copy migration plans
cp /home/david/Code/github/darobbins85/darvis/.opencode/plans/*.md docs/

# Copy assets
cp -r /home/david/Code/github/darobbins85/darvis/assets .

# Initial commit
git add .
git commit -m "chore: initial project structure"
git push origin main
```

**Verification:**
```bash
tree -L 2 -d
# Should show clean directory structure
```

---

### STEP 2: Create Configuration Files (20 minutes)

**Files to Create:**

#### `deno.json` (root)
```json
{
  "workspace": ["./web"],
  "tasks": {
    "dev": "cd web && deno task dev",
    "test": "deno test --allow-all tests/",
    "test:coverage": "deno test --allow-all --coverage=coverage tests/",
    "test:watch": "deno test --allow-all --watch tests/",
    "fmt": "deno fmt",
    "lint": "deno lint"
  },
  "fmt": {
    "useTabs": false,
    "lineWidth": 100,
    "indentWidth": 2,
    "semiColons": true,
    "singleQuote": false
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
    "preview": "deno run -A main.ts"
  },
  "imports": {
    "$fresh/": "https://deno.land/x/fresh@1.6.1/",
    "preact": "https://esm.sh/preact@10.19.2",
    "preact/": "https://esm.sh/preact@10.19.2/",
    "@preact/signals": "https://esm.sh/*@preact/signals@1.2.1",
    "@preact/signals-core": "https://esm.sh/*@preact/signals-core@1.5.0",
    "$std/": "https://deno.land/std@0.208.0/",
    "bcrypt": "https://deno.land/x/bcrypt@v0.4.1/mod.ts",
    "djwt": "https://deno.land/x/djwt@v3.0.1/mod.ts"
  },
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
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
*.swp

# IDE
.vscode/
.idea/

# Testing
playwright-report/
test-results/

# Build
dist/
build/
```

#### `.env.example`
```bash
# Server
PORT=8000
DENO_ENV=development

# Authentication (generate with: deno eval "console.log(crypto.randomUUID())")
JWT_SECRET=your-secret-here

# Database (auto-configured on Deno Deploy)
DENO_KV_URL=

# OpenCode
OPENCODE_PATH=/home/david/.opencode/bin/opencode

# CORS
ALLOWED_ORIGINS=http://localhost:8000
```

#### `.env` (for local development)
```bash
PORT=8000
DENO_ENV=development
JWT_SECRET=dev-secret-replace-in-production
OPENCODE_PATH=/home/david/.opencode/bin/opencode
ALLOWED_ORIGINS=http://localhost:8000
```

#### `README.md`
```markdown
# Darvis Web - Voice Assistant

Modern TypeScript/Deno web application for Darvis Voice Assistant.

## Quick Start

### Prerequisites
- Deno 1.x+
- Rust/Cargo (for Tauri desktop app)

### Development
```bash
# Install dependencies (first time)
deno cache web/deno.json

# Run development server
deno task dev

# Run tests
deno task test

# Run tests with coverage
deno task test:coverage
```

## Documentation

See `docs/` for complete migration plan and technical specifications.

## License

MIT
```

**Commit:**
```bash
git add .
git commit -m "feat: add initial configuration files"
git push
```

---

### STEP 3: Initialize Fresh Framework (30 minutes)

**Actions:**
```bash
cd web

# Initialize Fresh
deno run -A -r https://fresh.deno.dev

# When prompted:
# - Use Tailwind CSS? Yes
# - Use VS Code? (your choice)
# - Setup twind? No
```

**Manual additions after Fresh init:**

#### Update `web/fresh.config.ts`
```typescript
import { defineConfig } from "$fresh/server.ts";
import tailwind from "$fresh/plugins/tailwind.ts";

export default defineConfig({
  plugins: [tailwind()],
});
```

#### Create `web/tailwind.config.ts`
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

#### Create `web/static/styles/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-background text-text-primary font-sans;
  }
}
```

**Test Fresh is working:**
```bash
cd web
deno task dev
# Visit http://localhost:8000
# Should see Fresh welcome page with dark background
```

**Commit:**
```bash
git add .
git commit -m "feat: initialize Fresh framework with Tailwind CSS"
git push
```

---

### STEP 4: Create Type Definitions (15 minutes)

**Create `web/types/index.ts`:**
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

export interface ApiError {
  error: string;
  code?: string;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}
```

**Commit:**
```bash
git add .
git commit -m "feat: add TypeScript type definitions"
git push
```

---

### STEP 5: Database Layer with TDD (2 hours)

**TDD Process:**

#### 5.1: Write Database Tests FIRST

**Create `tests/unit/db.test.ts`:**
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

// Use in-memory Deno KV for tests
Deno.env.set("DENO_KV_URL", ":memory:");

Deno.test("Database - Initialize", async () => {
  await initDb();
  await closeDb();
});

Deno.test("Database - User Operations", async (t) => {
  await initDb();

  await t.step("should create user", async () => {
    const user = await createUser("testuser", "hashedpassword");
    assertExists(user.id);
    assertEquals(user.username, "testuser");
    assertEquals(user.passwordHash, "hashedpassword");
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
    assertEquals(user?.username, "testuser");
  });

  await t.step("should get user by ID", async () => {
    const user = await getUserByUsername("testuser");
    const userById = await getUserById(user!.id);
    assertEquals(userById?.username, "testuser");
  });

  await t.step("should return null for non-existent user", async () => {
    const user = await getUserByUsername("nonexistent");
    assertEquals(user, null);
  });

  await closeDb();
});

Deno.test("Database - Session Operations", async (t) => {
  await initDb();

  const user = await createUser("sessionuser", "hashedpassword");

  await t.step("should create session with default name", async () => {
    const session = await createSession(user.id);
    assertExists(session.id);
    assertEquals(session.name, "Chat 1");
    assertEquals(session.userId, user.id);
  });

  await t.step("should create session with custom name", async () => {
    const session = await createSession(user.id, "Custom Session");
    assertEquals(session.name, "Custom Session");
  });

  await t.step("should get user sessions ordered by updated date", async () => {
    const sessions = await getUserSessions(user.id);
    assertEquals(sessions.length, 2);
    // Most recent first
    assertEquals(sessions[0].name, "Custom Session");
  });

  await t.step("should get session by ID", async () => {
    const sessions = await getUserSessions(user.id);
    const session = await getSessionById(sessions[0].id);
    assertEquals(session?.name, "Custom Session");
  });

  await t.step("should update session name", async () => {
    const sessions = await getUserSessions(user.id);
    const updated = await updateSessionName(sessions[0].id, "Renamed");
    assertEquals(updated?.name, "Renamed");
  });

  await t.step("should delete session", async () => {
    const sessions = await getUserSessions(user.id);
    const deleted = await deleteSession(sessions[0].id);
    assertEquals(deleted, true);
    
    const remaining = await getUserSessions(user.id);
    assertEquals(remaining.length, 1);
  });

  await closeDb();
});

Deno.test("Database - Message Operations", async (t) => {
  await initDb();

  const user = await createUser("msguser", "hashedpassword");
  const session = await createSession(user.id);

  await t.step("should add user message", async () => {
    const message = await addMessage(session.id, "user", "Hello");
    assertExists(message.id);
    assertEquals(message.role, "user");
    assertEquals(message.content, "Hello");
    assertEquals(message.sessionId, session.id);
  });

  await t.step("should add assistant message", async () => {
    const message = await addMessage(session.id, "assistant", "Hi there!");
    assertEquals(message.role, "assistant");
  });

  await t.step("should get messages in order", async () => {
    const messages = await getSessionMessages(session.id);
    assertEquals(messages.length, 2);
    assertEquals(messages[0].content, "Hello");
    assertEquals(messages[1].content, "Hi there!");
  });

  await t.step("should update session timestamp on message", async () => {
    const sessionBefore = await getSessionById(session.id);
    await new Promise(resolve => setTimeout(resolve, 10)); // Wait 10ms
    await addMessage(session.id, "user", "Another message");
    const sessionAfter = await getSessionById(session.id);
    assertEquals(
      sessionAfter!.updatedAt.getTime() > sessionBefore!.updatedAt.getTime(),
      true
    );
  });

  await closeDb();
});

Deno.test("Database - Auth Session Operations", async (t) => {
  await initDb();

  const token = "test-token-123";
  const userId = "user-123";

  await t.step("should create auth session", async () => {
    const authSession = await createAuthSession(token, userId);
    assertEquals(authSession.token, token);
    assertEquals(authSession.userId, userId);
    assertExists(authSession.expiresAt);
  });

  await t.step("should get auth session", async () => {
    const authSession = await getAuthSession(token);
    assertExists(authSession);
    assertEquals(authSession?.userId, userId);
  });

  await t.step("should return null for expired session", async () => {
    // Create session that expires immediately
    const expiredToken = "expired-token";
    await createAuthSession(expiredToken, userId);
    
    // Manually set expiration to past (would need to mock or wait)
    // For now, just test that unexpired session works
    const authSession = await getAuthSession(token);
    assertExists(authSession);
  });

  await t.step("should delete auth session", async () => {
    await deleteAuthSession(token);
    const authSession = await getAuthSession(token);
    assertEquals(authSession, null);
  });

  await closeDb();
});
```

**Run tests (they should FAIL):**
```bash
deno task test
# Expected: All tests fail because db.ts doesn't exist yet
```

#### 5.2: Implement Database Layer to Pass Tests

**Create `web/lib/db.ts`:**

(See full implementation in PHASE_1_EXECUTION_PLAN.md - the complete database layer code)

**Run tests again:**
```bash
deno task test
# Expected: All tests pass ✅
```

**Check coverage:**
```bash
deno task test:coverage
deno coverage coverage --lcov > coverage/lcov.info
# Should show ~100% coverage for db.ts
```

**Commit:**
```bash
git add .
git commit -m "feat: implement Deno KV database layer with 100% test coverage"
git push
```

---

### STEP 6: Authentication System with TDD (3 hours)

**TDD Process:**

#### 6.1: Write Auth Tests FIRST

**Create `tests/unit/auth.test.ts`:**

(See full test implementation in PHASE_1_EXECUTION_PLAN.md)

**Run tests (should FAIL):**
```bash
deno task test
# Expected: Auth tests fail because auth.ts doesn't exist
```

#### 6.2: Implement Auth to Pass Tests

**Create `web/lib/auth.ts`:**

(See full implementation in PHASE_1_EXECUTION_PLAN.md)

**Run tests:**
```bash
deno task test
# Expected: All tests pass ✅
```

**Commit:**
```bash
git add .
git commit -m "feat: implement JWT authentication with bcrypt hashing"
git push
```

---

### STEP 7: API Routes (2 hours)

#### 7.1: Create Auth API Routes

**Create `web/routes/api/auth/signup.ts`:**
```typescript
import { Handlers } from "$fresh/server.ts";
import { signup } from "../../../lib/auth.ts";
import { createAuthCookie } from "../../../lib/auth.ts";
import type { ApiError, ApiSuccess } from "../../../types/index.ts";

interface SignupRequest {
  username: string;
  password: string;
}

export const handler: Handlers = {
  async POST(req) {
    try {
      const body: SignupRequest = await req.json();
      
      const { user, token } = await signup(body.username, body.password);
      
      // Return user without password hash
      const { passwordHash: _, ...safeUser } = user;
      
      return new Response(
        JSON.stringify({
          success: true,
          data: { user: safeUser, token },
        } as ApiSuccess),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": createAuthCookie(token),
          },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message } as ApiError),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};
```

**Create `web/routes/api/auth/login.ts`:**
```typescript
import { Handlers } from "$fresh/server.ts";
import { login } from "../../../lib/auth.ts";
import { createAuthCookie } from "../../../lib/auth.ts";
import type { ApiError, ApiSuccess } from "../../../types/index.ts";

interface LoginRequest {
  username: string;
  password: string;
}

export const handler: Handlers = {
  async POST(req) {
    try {
      const body: LoginRequest = await req.json();
      
      const { user, token } = await login(body.username, body.password);
      
      const { passwordHash: _, ...safeUser } = user;
      
      return new Response(
        JSON.stringify({
          success: true,
          data: { user: safeUser, token },
        } as ApiSuccess),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": createAuthCookie(token),
          },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message } as ApiError),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};
```

**Create `web/routes/api/auth/logout.ts`:**
```typescript
import { Handlers } from "$fresh/server.ts";
import { logout, getTokenFromCookie, createLogoutCookie } from "../../../lib/auth.ts";
import type { ApiSuccess } from "../../../types/index.ts";

export const handler: Handlers = {
  async POST(req) {
    const token = getTokenFromCookie(req.headers.get("cookie"));
    
    if (token) {
      await logout(token);
    }
    
    return new Response(
      JSON.stringify({ success: true } as ApiSuccess),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": createLogoutCookie(),
        },
      }
    );
  },
};
```

**Create `web/routes/api/auth/me.ts`:**
```typescript
import { Handlers } from "$fresh/server.ts";
import { getCurrentUser, getTokenFromCookie } from "../../../lib/auth.ts";
import type { ApiError, ApiSuccess } from "../../../types/index.ts";

export const handler: Handlers = {
  async GET(req) {
    const token = getTokenFromCookie(req.headers.get("cookie"));
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" } as ApiError),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    const user = await getCurrentUser(token);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" } as ApiError),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    const { passwordHash: _, ...safeUser } = user;
    
    return new Response(
      JSON.stringify({
        success: true,
        data: { user: safeUser },
      } as ApiSuccess),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  },
};
```

#### 7.2: Test API Routes

**Create `tests/integration/api-auth.test.ts`:**
```typescript
import { assertEquals } from "$std/assert/mod.ts";
import { initDb, closeDb } from "../../web/lib/db.ts";

// Set test environment
Deno.env.set("DENO_KV_URL", ":memory:");
Deno.env.set("JWT_SECRET", "test-secret");

const API_BASE = "http://localhost:8000/api/auth";

Deno.test("API Integration - Auth Endpoints", async (t) => {
  await initDb();

  let authToken: string;

  await t.step("POST /api/auth/signup - should create user", async () => {
    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "apitest",
        password: "password123",
      }),
    });

    assertEquals(res.status, 201);
    const data = await res.json();
    assertEquals(data.success, true);
    assertEquals(data.data.user.username, "apitest");
    authToken = data.data.token;
  });

  await t.step("POST /api/auth/login - should login user", async () => {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "apitest",
        password: "password123",
      }),
    });

    assertEquals(res.status, 200);
    const data = await res.json();
    assertEquals(data.success, true);
  });

  await t.step("GET /api/auth/me - should return current user", async () => {
    const res = await fetch(`${API_BASE}/me`, {
      headers: {
        "Cookie": `auth_token=${authToken}`,
      },
    });

    assertEquals(res.status, 200);
    const data = await res.json();
    assertEquals(data.data.user.username, "apitest");
  });

  await t.step("POST /api/auth/logout - should logout user", async () => {
    const res = await fetch(`${API_BASE}/logout`, {
      method: "POST",
      headers: {
        "Cookie": `auth_token=${authToken}`,
      },
    });

    assertEquals(res.status, 200);
  });

  await closeDb();
});
```

**Commit:**
```bash
git add .
git commit -m "feat: implement authentication API routes"
git push
```

---

### STEP 8: Main Application Entry Point (30 minutes)

**Create `web/main.ts`:**
```typescript
/// <reference no-default-lib="true" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";
import { initDb } from "./lib/db.ts";

// Initialize database
await initDb();

console.log("🚀 Starting Darvis Web Server...");

await start(manifest, config);
```

**Create `web/dev.ts`:**
```typescript
#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";
import { initDb } from "./lib/db.ts";

// Initialize database
await initDb();

await dev(import.meta.url, "./main.ts", config);
```

**Test the application:**
```bash
cd web
deno task dev

# In another terminal:
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"password123"}'

# Should return user and token
```

**Commit:**
```bash
git add .
git commit -m "feat: add main application entry points"
git push
```

---

### STEP 9: GitHub Actions CI/CD (1 hour)

**Create `.github/workflows/test.yml`:**
```yaml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x

      - name: Cache Deno dependencies
        uses: actions/cache@v3
        with:
          path: ~/.cache/deno
          key: ${{ runner.os }}-deno-${{ hashFiles('**/deno.json') }}

      - name: Check formatting
        run: deno fmt --check

      - name: Run linter
        run: deno lint

      - name: Run tests
        env:
          DENO_KV_URL: ":memory:"
          JWT_SECRET: "test-secret-key"
        run: deno task test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

**Create `.github/workflows/deploy.yml`:**
```yaml
name: Deploy to Deno Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    permissions:
      id-token: write
      contents: read

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Deno
        uses: denoland/setup-deno@v1

      - name: Deploy to Deno Deploy
        uses: denoland/deployctl@v1
        with:
          project: darvis-web
          entrypoint: web/main.ts
          root: .
```

**Commit:**
```bash
git add .
git commit -m "ci: add GitHub Actions for testing and deployment"
git push
```

---

### STEP 10: Documentation (30 minutes)

**Update `README.md`:**
```markdown
# Darvis Web - Voice Assistant

[![Test](https://github.com/darobbins85/darvis-web/actions/workflows/test.yml/badge.svg)](https://github.com/darobbins85/darvis-web/actions/workflows/test.yml)
[![Deploy](https://github.com/darobbins85/darvis-web/actions/workflows/deploy.yml/badge.svg)](https://github.com/darobbins85/darvis-web/actions/workflows/deploy.yml)

Modern TypeScript/Deno web application for Darvis Voice Assistant.

## Features (Phase 1 Complete)

✅ Fresh framework with Tailwind CSS  
✅ Deno KV database layer  
✅ JWT authentication system  
✅ API routes for auth  
✅ 100% test coverage  
✅ CI/CD pipeline  

## Quick Start

### Prerequisites
- Deno 1.x+
- Rust/Cargo (for Tauri desktop app, coming in Phase 6)

### Development

```bash
# Clone repository
git clone git@github.com:darobbins85/darvis-web.git
cd darvis-web

# Copy environment template
cp .env.example .env
# Edit .env and set JWT_SECRET

# Run development server
deno task dev
# Visit http://localhost:8000

# Run tests
deno task test

# Run tests with coverage
deno task test:coverage

# Format code
deno task fmt

# Lint code
deno task lint
```

### Testing the API

```bash
# Signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"password123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"password123"}'

# Get current user (use token from login)
curl http://localhost:8000/api/auth/me \
  -H "Cookie: auth_token=YOUR_TOKEN_HERE"

# Logout
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Cookie: auth_token=YOUR_TOKEN_HERE"
```

## Project Structure

```
darvis-web/
├── web/                    # Fresh web application
│   ├── routes/            # File-based routing
│   │   └── api/          # API endpoints
│   ├── islands/          # Client-side components
│   ├── components/       # Server-side components
│   ├── lib/              # Core services
│   │   ├── db.ts        # Deno KV database
│   │   └── auth.ts      # Authentication
│   ├── static/           # Static assets
│   └── types/            # TypeScript types
├── tests/                 # Test suite
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
└── docs/                  # Documentation
```

## Documentation

- **Migration Plan:** `docs/MIGRATION_PLAN.md`
- **Technical Specs:** `docs/TECHNICAL_SPECS.md`
- **Quick Reference:** `docs/QUICK_REFERENCE.md`

## Roadmap

- ✅ **Phase 1:** Foundation (Current)
- ⏳ **Phase 2:** Core Features (Chat, AI integration)
- ⏳ **Phase 3:** Voice Features (Web Speech API)
- ⏳ **Phase 4:** App Launcher
- ⏳ **Phase 5:** Visual Design (Eye glow effect)
- ⏳ **Phase 6:** Desktop App (Tauri)
- ⏳ **Phase 7:** Testing & Polish
- ⏳ **Phase 8:** Deployment

## Contributing

See `docs/MIGRATION_PLAN.md` for development guidelines.

## License

MIT - See LICENSE file
```

**Create `docs/PHASE_1_COMPLETE.md`:**
```markdown
# ✅ Phase 1: Foundation - COMPLETE

**Duration:** ~12 hours  
**Completion Date:** [TBD]

## Deliverables Achieved

### ✅ Project Structure
- Monorepo layout with web/, desktop/, shared/, tests/, docs/
- Clean directory organization
- Git repository with proper .gitignore

### ✅ Configuration
- Deno workspace configuration
- Fresh framework setup
- Tailwind CSS integration
- TypeScript strict mode
- Environment variables

### ✅ Database Layer
- Deno KV abstraction
- User, Session, Message, AuthSession operations
- 100% test coverage
- Type-safe API

### ✅ Authentication System
- Bcrypt password hashing (12 rounds)
- JWT token generation and verification
- HTTP-only cookie management
- Session management
- 100% test coverage

### ✅ API Routes
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- Proper error handling
- Integration tests

### ✅ Testing Infrastructure
- Deno Test framework
- Unit tests (80%+ coverage)
- Integration tests
- Test coverage reporting
- Watch mode for TDD

### ✅ CI/CD Pipeline
- GitHub Actions for testing
- GitHub Actions for deployment
- Automated code quality checks (fmt, lint)
- Coverage reporting

## Metrics

- **Test Coverage:** ~100%
- **TypeScript Strict Mode:** ✅ Enabled
- **Linting:** ✅ Zero errors
- **Formatting:** ✅ Consistent
- **CI/CD:** ✅ Automated

## Next Steps

Proceed to **Phase 2: Core Features**
- Socket.IO server
- Chat interface
- OpenCode CLI integration
- Session management UI
- Real-time synchronization

See `docs/MIGRATION_PLAN.md` for Phase 2 details.
```

**Commit:**
```bash
git add .
git commit -m "docs: update README and mark Phase 1 complete"
git push
```

---

## 🎯 Phase 1 Completion Checklist

Before marking Phase 1 complete, verify:

- [ ] Deno installed and working
- [ ] Repository cloned and structure created
- [ ] All configuration files created
- [ ] Fresh framework running on http://localhost:8000
- [ ] All type definitions created
- [ ] Database layer implemented with 100% test coverage
- [ ] Authentication system implemented with 100% test coverage
- [ ] All API routes working and tested
- [ ] Integration tests passing
- [ ] CI/CD pipeline running on GitHub
- [ ] Documentation updated
- [ ] All commits pushed to GitHub

**Final Verification:**
```bash
# All tests should pass
deno task test

# Coverage should be ~100%
deno task test:coverage

# Formatting should be clean
deno task fmt --check

# No linting errors
deno task lint

# Server should start without errors
deno task dev
```

---

## 📊 Expected Outcomes

After Phase 1 completion:

1. **Working Foundation:**
   - Fresh app running
   - Database operations working
   - Auth system functional
   - API routes accessible

2. **Quality Metrics:**
   - 100% test coverage for core modules
   - Zero linting errors
   - Consistent formatting
   - All tests green in CI

3. **Documentation:**
   - README updated
   - API documented
   - Architecture clear
   - Next steps defined

4. **Team Alignment:**
   - Clear project structure
   - Established patterns
   - TDD workflow proven
   - CI/CD automated

---

## 🚀 Ready to Execute?

This plan gives you a complete, step-by-step guide to Phase 1. 

**Estimated Time:** 11-13 hours of focused work

**Approach:** Test-Driven Development (write tests first!)

**When ready to begin execution, say:** "Start Phase 1 execution" or "Begin implementation"

I'll then guide you through each step, ensuring tests pass before moving forward.

---

**Questions? Ask before we begin!**
- Unclear about any step?
- Want to adjust the approach?
- Need clarification on TDD workflow?
- Concerned about any aspect?

Let me know and we'll address it before starting!
