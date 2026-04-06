# 🚀 Phase 1: Step-by-Step Execution Plan

**Mode:** Guided Implementation  
**Approach:** Test-Driven Development (TDD)  
**Duration:** 11-13 hours over 2 weeks  
**Current Status:** ✅ Ready to Execute

---

## 📋 Pre-Execution Checklist

### ✅ Confirmed Prerequisites
- ✅ Deno 2.7.11 installed and working
- ✅ Cargo 1.92.0 installed
- ✅ Python changes stashed (stash@{0})
- ✅ GitHub repo created: git@github.com:darobbins85/darvis-web.git
- ✅ Planning documents complete (5 files in .opencode/plans/)
- ✅ Assets available (3 logo files in assets/)
- ✅ MIT License ready to copy

---

## 🎯 Phase 1 Goals

Build a production-ready foundation:
1. Fresh framework with Tailwind CSS
2. Deno KV database layer (100% test coverage)
3. JWT authentication (100% test coverage)
4. API routes for auth
5. CI/CD pipeline
6. Complete documentation

---

## 📝 Step-by-Step Execution Plan

### STEP 0: Clone Repository and Create Structure (10 minutes)

**What we'll do:**
1. Clone darvis-web from GitHub
2. Create complete directory structure
3. Copy migration plans from old repo
4. Copy logo assets
5. Copy LICENSE file
6. Make initial commit

**Commands I'll execute:**
```bash
cd /home/david/Code/github/darobbins85/
git clone git@github.com:darobbins85/darvis-web.git
cd darvis-web

# Create directory structure
mkdir -p web/routes/api/auth
mkdir -p web/islands
mkdir -p web/components
mkdir -p web/lib
mkdir -p web/static/styles
mkdir -p web/types
mkdir -p desktop/src-tauri/src
mkdir -p shared/types
mkdir -p config
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/e2e
mkdir -p tests/visual
mkdir -p scripts
mkdir -p docs
mkdir -p logs

# Copy planning docs
cp /home/david/Code/github/darobbins85/darvis/.opencode/plans/*.md docs/

# Copy assets
mkdir -p assets
cp /home/david/Code/github/darobbins85/darvis/assets/*.png assets/

# Copy LICENSE
cp /home/david/Code/github/darobbins85/darvis/LICENSE .
```

**Files I'll create:**
- `.gitignore`
- `.env.example`
- `.env` (with dev values)
- `README.md` (initial version)

**Verification:**
- `tree -L 2 -d` shows proper structure
- Assets copied successfully
- LICENSE file present

**Checkpoint:** Initial commit and push to GitHub

**Questions for you:**
- Any additional directories needed?
- Should we keep any specific files from the GitHub template?

---

### STEP 1: Configure Deno Workspace (20 minutes)

**What we'll do:**
1. Create root `deno.json` (workspace config)
2. Create `web/deno.json` (Fresh config with dependencies)
3. Update `.gitignore` for Deno/Fresh
4. Set up environment variables

**Files I'll create:**

1. **`deno.json`** - Workspace configuration with tasks
2. **`web/deno.json`** - Fresh imports and TypeScript config (strict mode)
3. **`.gitignore`** - Deno, Fresh, coverage, logs, environment files
4. **`.env.example`** - Template with comments
5. **`.env`** - Local dev values (not committed)

**Verification:**
- `deno task --help` shows all tasks
- TypeScript strict mode enabled
- Dependencies listed correctly

**Checkpoint:** Commit configuration files

**Questions for you:**
- Any specific Deno tasks you want in the workflow?
- Additional dependencies to include now?

---

### STEP 2: Initialize Fresh Framework (30 minutes)

**What we'll do:**
1. Run Fresh initialization
2. Configure Tailwind CSS
3. Create custom dark theme (Darvis colors)
4. Set up global styles
5. Test server starts

**Fresh initialization:**
```bash
cd web
deno run -A -r https://fresh.deno.dev
```

**Manual configuration after init:**
- Update `fresh.config.ts` with Tailwind plugin
- Create `tailwind.config.ts` with Darvis color scheme
- Create `static/styles/globals.css` with base styles

**Darvis Color Scheme:**
```typescript
colors: {
  background: '#0f1419',    // Dark background
  surface: '#1a1f29',       // Lighter surface
  primary: '#00d4aa',       // Teal (Darvis brand)
  success: '#10b981',       // Green
  error: '#ef4444',         // Red
  warning: '#f59e0b',       // Orange
  'text-primary': '#f9fafb',      // Off-white
  'text-secondary': '#9ca3af',    // Gray
}
```

**Verification:**
```bash
cd web
deno task dev
# Visit http://localhost:8000
# Should see Fresh page with dark background
```

**Checkpoint:** Commit Fresh framework setup

**Questions for you:**
- Happy with the color scheme? Any adjustments?
- Any additional Tailwind plugins needed?

---

### STEP 3: Create TypeScript Type Definitions (15 minutes)

**What we'll do:**
1. Create all TypeScript interfaces
2. Export them from `web/types/index.ts`
3. Enable strict typing across the project

**File I'll create:**

**`web/types/index.ts`** with interfaces:
- `User` - id, username, passwordHash, createdAt
- `Session` - id, userId, name, aiSessionId, createdAt, updatedAt
- `Message` - id, sessionId, role, content, createdAt
- `AuthSession` - token, userId, expiresAt
- `ApiError` - error, code
- `ApiSuccess<T>` - success, data

**Verification:**
- All types properly exported
- No TypeScript errors
- Types available for import

**Checkpoint:** Commit type definitions

**Questions for you:**
- Any additional types needed for Phase 1?
- Want to add JSDoc comments now or later?

---

### STEP 4: Database Layer - Part 1: Write Tests (45 minutes)

**What we'll do:**
1. Create comprehensive database tests FIRST (TDD)
2. Test all CRUD operations
3. Run tests (they should FAIL - this is expected!)

**File I'll create:**

**`tests/unit/db.test.ts`** with test suites for:

1. **Database Initialization**
   - Should initialize and close cleanly

2. **User Operations**
   - Should create user
   - Should not create duplicate username
   - Should get user by username
   - Should get user by ID
   - Should return null for non-existent user

3. **Session Operations**
   - Should create session with default name
   - Should create session with custom name
   - Should get user sessions ordered by date
   - Should get session by ID
   - Should update session name
   - Should update session with AI ID
   - Should delete session

4. **Message Operations**
   - Should add user message
   - Should add assistant message
   - Should get messages in order
   - Should update session timestamp on message

5. **Auth Session Operations**
   - Should create auth session
   - Should get auth session
   - Should return null for expired session
   - Should delete auth session

**Verification:**
```bash
deno task test
# Expected: All tests FAIL (db.ts doesn't exist yet)
# This is CORRECT for TDD - Red phase
```

**Checkpoint:** Commit database tests (failing)

**Questions for you:**
- Are these test cases comprehensive enough?
- Any edge cases to add?

---

### STEP 5: Database Layer - Part 2: Implementation (1 hour)

**What we'll do:**
1. Implement `web/lib/db.ts` to pass all tests
2. Use Deno KV for storage
3. Implement all CRUD operations
4. Run tests until they all pass (Green phase)

**File I'll create:**

**`web/lib/db.ts`** with:

**Functions:**
- `initDb()` - Initialize Deno KV connection
- `closeDb()` - Close connection
- `getDb()` - Get DB instance

**User Operations:**
- `createUser(username, passwordHash)` - Atomic check + create
- `getUserByUsername(username)` - Lookup via index
- `getUserById(userId)` - Direct lookup

**Session Operations:**
- `createSession(userId, name?)` - Auto-number sessions
- `getUserSessions(userId)` - Sorted by updatedAt
- `getSessionById(sessionId)` - Direct lookup
- `updateSessionName(sessionId, name)` - Update + timestamp
- `updateSessionAiId(sessionId, aiSessionId)` - Link AI session
- `deleteSession(sessionId)` - Cascade delete messages
- `getNextSessionNumber(userId)` - Helper for auto-naming

**Message Operations:**
- `addMessage(sessionId, role, content)` - Add + update session timestamp
- `getSessionMessages(sessionId)` - Sorted by createdAt

**Auth Session Operations:**
- `createAuthSession(token, userId)` - 24h expiration
- `getAuthSession(token)` - Check expiration
- `deleteAuthSession(token)` - Logout

**Verification:**
```bash
deno task test
# Expected: All tests PASS ✅ (Green phase)
```

**Coverage check:**
```bash
deno task test:coverage
# Expected: ~100% coverage for db.ts
```

**Checkpoint:** Commit working database layer

**Questions for you:**
- Should we refactor anything? (TDD Refactor phase)
- Performance concerns with any queries?

---

### STEP 6: Authentication System - Part 1: Write Tests (45 minutes)

**What we'll do:**
1. Create comprehensive auth tests FIRST (TDD)
2. Test all authentication flows
3. Run tests (they should FAIL)

**File I'll create:**

**`tests/unit/auth.test.ts`** with test suites for:

1. **Password Hashing**
   - Should hash password (bcrypt $2a$)
   - Should verify correct password
   - Should reject incorrect password

2. **User Signup**
   - Should signup new user
   - Should return user and token
   - Should reject short username (< 3 chars)
   - Should reject short password (< 6 chars)
   - Should reject duplicate username

3. **User Login**
   - Should login with correct credentials
   - Should return user and token
   - Should reject wrong password
   - Should reject non-existent user

4. **User Logout**
   - Should logout user
   - Should invalidate token

5. **Get Current User**
   - Should get user from valid token
   - Should return null for invalid token
   - Should return null for expired token

6. **Cookie Helpers**
   - Should extract token from cookie header
   - Should return null for missing cookie
   - Should create auth cookie (HttpOnly, Secure, SameSite)
   - Should create logout cookie (Max-Age=0)

**Verification:**
```bash
deno task test
# Expected: Auth tests FAIL (auth.ts doesn't exist yet)
# TDD Red phase
```

**Checkpoint:** Commit auth tests (failing)

**Questions for you:**
- Security requirements look good?
- Any additional auth flows to test?

---

### STEP 7: Authentication System - Part 2: Implementation (1.5 hours)

**What we'll do:**
1. Implement `web/lib/auth.ts` to pass all tests
2. Use bcrypt for password hashing (12 rounds)
3. Use djwt for JWT tokens
4. Implement secure cookie helpers
5. Run tests until they all pass

**File I'll create:**

**`web/lib/auth.ts`** with:

**Password Functions:**
- `hashPassword(password)` - Bcrypt with 12 rounds
- `verifyPassword(password, hash)` - Bcrypt compare

**Token Functions:**
- `createToken(userId)` - JWT with 24h expiration
- `verifyToken(token)` - JWT verify + return userId

**Auth Functions:**
- `signup(username, password)` - Validate, hash, create user, return token
- `login(username, password)` - Get user, verify password, return token
- `logout(token)` - Delete auth session
- `getCurrentUser(token)` - Verify + get user

**Cookie Functions:**
- `getTokenFromCookie(cookieHeader)` - Parse auth_token
- `createAuthCookie(token)` - HttpOnly, Secure, SameSite=Strict, 24h
- `createLogoutCookie()` - Max-Age=0

**Security Configuration:**
- Bcrypt: 12 rounds (strong but performant)
- JWT: HS256 algorithm
- Cookies: HttpOnly, Secure, SameSite=Strict
- Sessions: 24-hour expiration

**Verification:**
```bash
deno task test
# Expected: All auth tests PASS ✅
```

**Coverage check:**
```bash
deno task test:coverage
# Expected: ~100% coverage for auth.ts
```

**Checkpoint:** Commit working authentication system

**Questions for you:**
- Is 12 bcrypt rounds appropriate? (balance security vs speed)
- 24-hour session timeout okay?

---

### STEP 8: API Routes (1.5 hours)

**What we'll do:**
1. Create Fresh API routes for authentication
2. Implement error handling
3. Return proper HTTP status codes
4. Set auth cookies
5. Write integration tests

**Files I'll create:**

**API Route Files:**

1. **`web/routes/api/auth/signup.ts`**
   - POST handler
   - Validate input
   - Call signup()
   - Return user + token
   - Set cookie
   - Status: 201 Created

2. **`web/routes/api/auth/login.ts`**
   - POST handler
   - Call login()
   - Return user + token
   - Set cookie
   - Status: 200 OK

3. **`web/routes/api/auth/logout.ts`**
   - POST handler
   - Call logout()
   - Clear cookie
   - Status: 200 OK

4. **`web/routes/api/auth/me.ts`**
   - GET handler
   - Extract token from cookie
   - Call getCurrentUser()
   - Return user (without password hash)
   - Status: 200 OK or 401 Unauthorized

**Error Handling:**
- 400 Bad Request - Invalid input
- 401 Unauthorized - Auth failure
- 500 Internal Server Error - Unexpected errors

**Integration Tests:**

**`tests/integration/api-auth.test.ts`**
- Test signup endpoint
- Test login endpoint
- Test me endpoint with token
- Test logout endpoint
- Test error cases

**Verification:**
```bash
# Start dev server
cd web && deno task dev

# In another terminal, test with curl:
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Should return user + token ✅
```

**Checkpoint:** Commit API routes and integration tests

**Questions for you:**
- Any additional API endpoints needed for Phase 1?
- Error messages clear enough?

---

### STEP 9: Application Entry Points (30 minutes)

**What we'll do:**
1. Create main application entry point
2. Create development server entry
3. Initialize database on startup
4. Test full application works

**Files I'll create:**

1. **`web/main.ts`**
   - Production entry point
   - Initialize database
   - Start Fresh server
   - Environment: production

2. **`web/dev.ts`**
   - Development entry point
   - Initialize database
   - Hot reload enabled
   - Watch routes and static files
   - Environment: development

**Verification:**
```bash
# Development mode
cd web
deno task dev
# Should start on http://localhost:8000

# Test all endpoints work:
# - Signup works
# - Login works
# - Get current user works
# - Logout works
```

**Checkpoint:** Commit application entry points

**Questions for you:**
- Any startup tasks to add?
- Logging preferences?

---

### STEP 10: GitHub Actions CI/CD (1 hour)

**What we'll do:**
1. Create test workflow
2. Create deployment workflow
3. Configure environment secrets
4. Test workflows run

**Files I'll create:**

1. **`.github/workflows/test.yml`**
   - Trigger: push, pull request
   - Jobs: format, lint, test
   - Coverage reporting
   - Fail on any errors

2. **`.github/workflows/deploy.yml`**
   - Trigger: push to main
   - Job: Deploy to Deno Deploy
   - Requires: tests passing
   - Environment: production

**Workflow Steps:**
```yaml
# Test workflow:
1. Checkout code
2. Setup Deno
3. Cache dependencies
4. Check formatting (deno fmt --check)
5. Run linter (deno lint)
6. Run tests with coverage
7. Upload coverage to Codecov

# Deploy workflow:
1. Checkout code
2. Setup Deno
3. Deploy to Deno Deploy
```

**GitHub Setup Required (I'll guide you):**
1. Enable GitHub Actions
2. Set up Deno Deploy integration
3. Add secrets: JWT_SECRET (I'll show you how)

**Verification:**
- Push triggers test workflow
- Tests pass in CI
- Badge shows passing

**Checkpoint:** Commit CI/CD workflows

**Questions for you:**
- Want to deploy to Deno Deploy now or wait until Phase 2?
- Any additional CI checks?

---

### STEP 11: Documentation and Wrap-up (30 minutes)

**What we'll do:**
1. Update README with Phase 1 completion status
2. Create PHASE_1_COMPLETE.md
3. Document all API endpoints
4. Add usage examples
5. Update badges
6. Final verification

**Files I'll create/update:**

1. **`README.md`** - Updated with:
   - Phase 1 complete badge
   - Features implemented
   - Quick start guide
   - API usage examples
   - Test instructions
   - Project structure

2. **`docs/PHASE_1_COMPLETE.md`** - Documenting:
   - All deliverables
   - Test coverage metrics
   - What was built
   - Next steps (Phase 2 preview)

3. **`docs/API.md`** - API documentation:
   - Authentication endpoints
   - Request/response formats
   - Error codes
   - cURL examples

**Final Verification Checklist:**
```bash
# All tests pass
deno task test
✅ All tests passing

# Coverage is high
deno task test:coverage
✅ ~100% coverage for core modules

# No linting errors
deno task lint
✅ No errors

# Formatting is clean
deno task fmt --check
✅ All files formatted

# Server starts
deno task dev
✅ Runs on http://localhost:8000

# API works
curl endpoints
✅ All endpoints respond correctly

# CI passes
Check GitHub Actions
✅ All workflows green
```

**Checkpoint:** Final commit marking Phase 1 complete

**Questions for you:**
- Anything else to document?
- Ready to move to Phase 2 planning?

---

## 🎯 Phase 1 Success Criteria

Phase 1 is complete when ALL of these are true:

### Functionality
- ✅ Fresh app runs on http://localhost:8000
- ✅ Can signup new user via API
- ✅ Can login existing user via API
- ✅ Can get current user via API
- ✅ Can logout via API
- ✅ Auth cookies are set properly
- ✅ Database persists data

### Code Quality
- ✅ All tests pass (`deno task test`)
- ✅ Test coverage ~100% for core modules
- ✅ No linting errors (`deno task lint`)
- ✅ Code properly formatted (`deno task fmt --check`)
- ✅ TypeScript strict mode (no `any` types)

### Documentation
- ✅ README complete with examples
- ✅ API endpoints documented
- ✅ Phase 1 completion documented
- ✅ Code has JSDoc comments

### CI/CD
- ✅ GitHub Actions workflows configured
- ✅ Tests run automatically
- ✅ All workflows passing
- ✅ Coverage reporting enabled

### Repository
- ✅ All changes committed
- ✅ All commits pushed to GitHub
- ✅ Clean git history
- ✅ No uncommitted changes

---

## 📊 Execution Tracking

I'll track our progress through each step:

| Step | Task | Status | Time | Notes |
|------|------|--------|------|-------|
| 0 | Clone & Structure | ⏳ Pending | 10m | |
| 1 | Deno Config | ⏳ Pending | 20m | |
| 2 | Fresh Setup | ⏳ Pending | 30m | |
| 3 | Type Definitions | ⏳ Pending | 15m | |
| 4 | DB Tests (TDD) | ⏳ Pending | 45m | |
| 5 | DB Implementation | ⏳ Pending | 1h | |
| 6 | Auth Tests (TDD) | ⏳ Pending | 45m | |
| 7 | Auth Implementation | ⏳ Pending | 1.5h | |
| 8 | API Routes | ⏳ Pending | 1.5h | |
| 9 | Entry Points | ⏳ Pending | 30m | |
| 10 | CI/CD | ⏳ Pending | 1h | |
| 11 | Documentation | ⏳ Pending | 30m | |

**Total Estimated Time:** 11-13 hours

---

## 🚦 How This Will Work

### For Each Step:

1. **I'll announce the step:**
   - "Starting Step X: [Task Name]"
   - Explain what we're doing
   - Show what files I'll create/modify

2. **I'll show you the plan:**
   - Exact commands I'll run
   - Code I'll write
   - Tests I'll create

3. **You review and approve:**
   - Say "looks good" or "proceed"
   - OR ask questions
   - OR request changes

4. **I'll execute:**
   - Create/modify files
   - Run commands
   - Run tests
   - Show results

5. **We verify together:**
   - Check tests pass
   - Verify functionality works
   - Review any errors

6. **Checkpoint commit:**
   - Commit the step
   - Push to GitHub
   - Move to next step

### Between Steps:

- **Questions encouraged!** Ask anything anytime
- **Pause anytime** - Say "pause" to stop and discuss
- **Adjust approach** - We can change course if needed
- **Take breaks** - This is 11-13 hours of work over 2 weeks

---

## ❓ Final Questions Before We Start

Before I switch from **PLAN MODE** to **EXECUTION MODE**, let's make sure we're aligned:

### Approach Questions:
1. **TDD Workflow:** Are you comfortable writing tests first (Red), then implementation (Green)? This might feel slow at first but ensures quality.

2. **Step Size:** 11 steps over 11-13 hours. Want more granular steps or is this good?

3. **Code Style:** Any preferences I should know? (naming conventions, comment style, etc.)

4. **Commit Messages:** Follow conventional commits format (feat:, fix:, docs:, etc.)?

### Technical Questions:
5. **JWT Secret:** For `.env`, should I generate a random one or let you set it?

6. **Deno Deploy:** Want to set up deployment now or wait until Phase 2 has features?

7. **Logo Usage:** Which logo should be primary? (darvis-logo.png, hires with green eyes, or red eyes?)

8. **Database:** Deno KV in-memory for tests, file-based for local dev. Sound good?

### Process Questions:
9. **Commit Frequency:** One commit per step (11 commits) or more granular?

10. **Review Time:** Want me to pause after each step for your review, or batch steps together?

11. **Working Hours:** Are we doing this all in one session or spreading over multiple days?

### Ready to Execute?

Once you answer any questions (or say "all good" if no questions), I'll:

1. **Switch to EXECUTION MODE** ✅
2. **Start with Step 0** (Clone & Structure)
3. **Create and modify files as planned**
4. **Run tests and verify each step**
5. **Commit progress at each checkpoint**

**Say one of:**
- **"All good, let's execute"** - Start with no more questions
- **"I have questions"** - Ask away!
- **"Let's start with Step 0"** - Begin execution
- **"Show me Step 0 in detail first"** - Deep dive before executing

---

**Ready to build when you are! 🚀**
