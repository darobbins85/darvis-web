# 🚀 Darvis Migration Plan: Python → TypeScript/Deno Web App

**Version:** 1.0.0  
**Date:** 2026-04-05  
**Status:** Planning Phase  
**Target Completion:** TBD

---

## 📋 Executive Summary

This document outlines the complete migration of Darvis Voice Assistant from a Python/Flask/Tkinter application to a modern TypeScript/Deno web application with Tauri desktop companion.

**Current Stack:** Python, Flask, Tkinter, SQLite, Socket.IO, pyttsx3, SpeechRecognition  
**Target Stack:** TypeScript, Deno, Fresh, Tauri, Deno KV, Socket.IO, Web Speech APIs

---

## 🎯 Project Goals

### Primary Objectives
1. **Feature Parity:** Maintain all current Darvis functionality
2. **Modern Stack:** Leverage TypeScript, Deno, and modern web APIs
3. **Production Ready:** Deploy on Deno Deploy with full test coverage
4. **Enhanced UX:** Responsive design, mobile support, improved visual feedback
5. **Cross-Session Alignment:** This document serves as source of truth across AI sessions

### Success Criteria
- ✅ All current features implemented in TypeScript
- ✅ Web app deployable to Deno Deploy
- ✅ Tauri desktop app with system tray integration
- ✅ Full test suite (unit, integration, E2E, visual regression)
- ✅ Real-time sync between web and desktop
- ✅ Production-grade security and error handling

---

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DARVIS ECOSYSTEM                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │  Web Client  │◄────────┤ Tauri Desktop│                 │
│  │  (Browser)   │  WebSocket  (Native)   │                 │
│  └──────┬───────┘         └──────┬───────┘                 │
│         │                         │                          │
│         │    Socket.IO / WS       │                          │
│         ▼                         ▼                          │
│  ┌─────────────────────────────────────────┐                │
│  │      Deno Server (Fresh Framework)      │                │
│  │  ┌──────────┬──────────┬──────────┐    │                │
│  │  │   API    │  Socket  │   Auth   │    │                │
│  │  │  Routes  │ Handlers │  System  │    │                │
│  │  └──────────┴──────────┴──────────┘    │                │
│  │  ┌──────────┬──────────┬──────────┐    │                │
│  │  │   AI     │   App    │  Speech  │    │                │
│  │  │ Service  │ Launcher │  Service │    │                │
│  │  └──────────┴──────────┴──────────┘    │                │
│  └─────────────────┬───────────────────────┘                │
│                    │                                         │
│         ┌──────────┼──────────┐                             │
│         ▼          ▼          ▼                             │
│    ┌────────┐ ┌────────┐ ┌──────────┐                      │
│    │ Deno KV│ │OpenCode│ │  System  │                      │
│    │Database│ │  CLI   │ │Commands  │                      │
│    └────────┘ └────────┘ └──────────┘                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Decision Matrix

All decisions below were made through the professional planning session questions:

#### Web Application
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Fresh (Deno) | Deno-native, Islands architecture, SSR, zero build step |
| **UI Components** | Custom from scratch | Brand consistency, full control, matches Darvis identity |
| **Styling** | Tailwind CSS | Utility-first, fast development, responsive, small bundle |
| **Real-time** | Socket.IO | Battle-tested, auto-reconnection, current architecture |
| **Speech Input** | Web Speech API (Browser) | Free, low latency, works offline, Chrome/Edge support |
| **Speech Output** | Web Speech Synthesis API | Free, instant, cross-platform, consistent UX |
| **Backend** | Deno Runtime | TypeScript-first, secure by default, modern |
| **Database** | Deno KV | Cloud-native, auto-scaling on Deno Deploy, simple API |
| **Authentication** | JWT + HTTP-only cookies | Secure, stateless, standard practice |

#### Desktop Application
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Tauri | Lightweight (~3MB), Rust backend, web frontend reuse |
| **System Integration** | Tauri APIs | Cross-platform system tray, notifications, shortcuts |
| **Communication** | WebSocket to same server | Unified architecture with web client |

#### Development & Quality
| Category | Technology | Rationale |
|----------|-----------|-----------|
| **Language** | TypeScript (strict mode) | Type safety, catch errors early, best practices |
| **Formatting** | deno fmt | Opinionated, zero config, built-in |
| **Linting** | deno lint | Built-in, consistent, Deno-specific |
| **Unit/Integration** | Deno Test | Built-in test runner, fast, no dependencies |
| **E2E Testing** | Playwright | Browser automation, reliable, cross-browser |
| **Visual Regression** | Percy or Chromatic | Catch visual bugs, automated screenshots |

---

## 📦 Project Structure (Monorepo)

```
darvis/
├── README.md                    # Main documentation
├── .opencode/
│   └── plans/
│       └── MIGRATION_PLAN.md   # This file (source of truth)
├── deno.json                   # Deno workspace configuration
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules
│
├── web/                        # Web application (Fresh)
│   ├── deno.json              # Web-specific Deno config
│   ├── fresh.config.ts        # Fresh framework configuration
│   ├── import_map.json        # Import mappings
│   │
│   ├── routes/                # Fresh file-based routes
│   │   ├── index.tsx          # Home page (/)
│   │   ├── login.tsx          # Login page (/login)
│   │   ├── signup.tsx         # Signup page (/signup)
│   │   ├── _middleware.ts     # Global middleware (auth)
│   │   ├── api/               # API routes
│   │   │   ├── auth.ts        # Authentication endpoints
│   │   │   ├── sessions.ts    # Session management
│   │   │   ├── messages.ts    # Message CRUD
│   │   │   └── voice.ts       # Voice processing
│   │   └── _app.tsx           # App wrapper
│   │
│   ├── islands/               # Client-side interactive components
│   │   ├── ChatInterface.tsx  # Main chat UI
│   │   ├── VoiceControl.tsx   # Push-to-talk button
│   │   ├── DarvisLogo.tsx     # Animated logo with eye glow
│   │   ├── SessionSidebar.tsx # Session list
│   │   └── DebugPanel.tsx     # Developer debug logs
│   │
│   ├── components/            # Server-side components
│   │   ├── Header.tsx         # App header
│   │   ├── Layout.tsx         # Page layout
│   │   └── ThemeProvider.tsx  # Dark theme provider
│   │
│   ├── lib/                   # Shared utilities
│   │   ├── db.ts             # Deno KV database helpers
│   │   ├── auth.ts           # Authentication logic
│   │   ├── socket.ts         # Socket.IO server setup
│   │   ├── ai.ts             # OpenCode CLI integration
│   │   ├── apps.ts           # App launcher logic
│   │   ├── logger.ts         # Logging system
│   │   └── config.ts         # Configuration management
│   │
│   ├── static/                # Static assets
│   │   ├── logo.png          # Darvis logo
│   │   ├── styles/           # Global CSS
│   │   │   └── globals.css   # Tailwind base styles
│   │   └── fonts/            # Custom fonts (if needed)
│   │
│   └── types/                 # TypeScript type definitions
│       ├── user.ts           # User types
│       ├── session.ts        # Session types
│       ├── message.ts        # Message types
│       └── events.ts         # Socket.IO event types
│
├── desktop/                   # Tauri desktop application
│   ├── src-tauri/            # Rust backend
│   │   ├── Cargo.toml        # Rust dependencies
│   │   ├── tauri.conf.json   # Tauri configuration
│   │   └── src/
│   │       ├── main.rs       # Rust entry point
│   │       ├── tray.rs       # System tray logic
│   │       └── commands.rs   # Tauri commands
│   │
│   ├── src/                  # Frontend (same as web)
│   │   └── index.html        # Entry point to web app
│   │
│   └── icons/                # Desktop app icons
│       └── icon.png          # Darvis logo for desktop
│
├── shared/                    # Shared code between web & desktop
│   ├── types/                # Shared TypeScript types
│   ├── constants.ts          # App constants
│   └── utils.ts              # Utility functions
│
├── config/                    # Configuration files (JSON)
│   ├── apps.json             # App launching definitions (50+ apps)
│   ├── wake-words.json       # Wake word list
│   └── platforms.json        # Platform-specific configs
│
├── tests/                     # Test suite
│   ├── unit/                 # Unit tests
│   │   ├── db.test.ts
│   │   ├── auth.test.ts
│   │   ├── ai.test.ts
│   │   └── apps.test.ts
│   │
│   ├── integration/          # Integration tests
│   │   ├── api.test.ts
│   │   ├── socket.test.ts
│   │   └── sessions.test.ts
│   │
│   ├── e2e/                  # End-to-end tests (Playwright)
│   │   ├── chat.test.ts
│   │   ├── voice.test.ts
│   │   ├── auth.test.ts
│   │   └── sync.test.ts
│   │
│   └── visual/               # Visual regression tests
│       ├── logo.test.ts
│       └── layout.test.ts
│
├── scripts/                   # Build & deployment scripts
│   ├── setup.ts              # Initial setup script
│   ├── migrate-db.ts         # Database migration from Python SQLite
│   ├── build-desktop.ts      # Desktop build script
│   └── deploy.ts             # Deployment script
│
├── docs/                      # Additional documentation
│   ├── API.md                # API documentation
│   ├── DEPLOYMENT.md         # Deployment guide
│   ├── DEVELOPMENT.md        # Development setup
│   └── TESTING.md            # Testing guide
│
└── .github/                   # GitHub configuration
    └── workflows/
        ├── test.yml          # CI testing
        ├── deploy-web.yml    # Deno Deploy automation
        └── build-desktop.yml # Desktop builds (Linux, macOS, Windows)
```

---

## 🎨 Complete Feature Specification

### Current Darvis Features (Python Version)

Based on comprehensive codebase analysis:

1. **Voice Recognition** - Google Speech API, wake word detection
2. **Text-to-Speech** - pyttsx3 cross-platform TTS
3. **AI Integration** - OpenCode CLI subprocess, session management
4. **App Launching** - 50+ apps (VS Code, Firefox, Calculator, etc.)
5. **Multi-user Authentication** - Flask-Login, password hashing
6. **Session Management** - SQLite database, per-user sessions
7. **Real-time Sync** - Desktop ↔ Web bidirectional synchronization
8. **Visual Feedback** - Terminator-style eye glow (green=wake, red=AI)
9. **Desktop GUI** - Tkinter with system tray (Linux/macOS/Windows)
10. **Web Interface** - Flask-SocketIO, Claude-inspired dark theme
11. **Waybar Integration** - Linux status bar display
12. **Cross-platform** - Linux, macOS, Windows support

### Feature Migration Strategy

| Feature | Current Implementation | New Implementation | Changes |
|---------|----------------------|-------------------|---------|
| **Voice Recognition** | Python SpeechRecognition → Google API | Browser Web Speech API | Push-to-talk instead of always-on |
| **Text-to-Speech** | pyttsx3 | Browser Web Speech Synthesis | Browser-native |
| **AI Integration** | Python subprocess → OpenCode CLI | Deno.Command() → OpenCode CLI | Same approach, different API |
| **App Launching** | Python subprocess | Deno.Command() | Same capability |
| **Authentication** | Flask-Login + Werkzeug | JWT + bcrypt | Stateless sessions |
| **Database** | SQLite | Deno KV | Cloud-native, migration script provided |
| **Real-time Sync** | Flask-SocketIO | Socket.IO (Deno) | Same protocol |
| **Desktop GUI** | Tkinter | Tauri (Rust + Web) | Different tech, same UX |
| **System Tray** | pystray | Tauri system tray | Cross-platform |
| **Visual Feedback** | PIL/Pillow pixel manipulation | Canvas API | Port glow algorithm |
| **Web UI** | Flask templates + vanilla JS | Fresh (TypeScript) | Modern framework |
| **Waybar** | FIFO pipe to waybar | Generalized system tray | Broader platform support |

---

## 🔐 Security Architecture

### 1. Authentication Flow

```typescript
// Signup
User submits username + password
  → Validate input
  → Hash password with bcrypt (12 rounds)
  → Store in Deno KV: ["user", userId] → User
  → Index: ["user_by_username", username] → userId
  → Generate JWT token (24h expiration)
  → Set HTTP-only cookie
  → Return user object

// Login
User submits username + password
  → Look up user: ["user_by_username", username]
  → Verify password with bcrypt
  → Generate JWT token
  → Set HTTP-only cookie
  → Return user object

// Authenticated Request
Request includes cookie with JWT
  → Middleware validates token
  → Extract userId from token
  → Load user from Deno KV
  → Attach to request context
  → Proceed to route handler
```

### 2. Authorization Rules

- Users can only access their own sessions
- All session queries filtered by `userId`
- Message queries verify session ownership
- WebSocket rooms scoped to `userId`

### 3. App Launching Security

**Risk:** Arbitrary command execution vulnerability

**Mitigations:**
1. **Whitelist approach:** Only apps in `config/apps.json` can be launched
2. **Command validation:** Verify command exists and is executable
3. **No user input in commands:** User provides app name, system looks up command
4. **Logging:** All app launches logged with user ID and timestamp
5. **Rate limiting:** Max 10 app launches per minute per user

### 4. XSS Prevention

- All user input escaped before rendering
- Content Security Policy headers
- No `dangerouslySetInnerHTML` without sanitization
- Trusted Types API for DOM manipulation

### 5. CSRF Protection

- HTTP-only cookies (prevent XSS access)
- SameSite=Strict cookie attribute
- CSRF tokens for mutation operations (future enhancement)

---

## 📊 Migration Roadmap (15 Weeks)

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Set up project structure and core infrastructure

#### Deliverables:
- ✅ Monorepo structure with web/ and desktop/ folders
- ✅ Fresh framework initialized
- ✅ Tailwind CSS configured
- ✅ Authentication system (signup, login, JWT)
- ✅ Deno KV database with helper functions
- ✅ Testing infrastructure (Deno Test, Playwright)
- ✅ CI/CD pipeline (GitHub Actions)

#### Key Tasks:
```bash
# Initialize project
mkdir -p darvis/{web,desktop,shared,config,tests,scripts,docs}
cd darvis/web
deno init

# Install Fresh
deno run -A -r https://fresh.deno.dev

# Configure Tailwind
# Set up Deno KV schema
# Implement auth endpoints
# Write auth tests
```

---

### Phase 2: Core Features (Weeks 3-5)

**Goal:** Implement chat and AI functionality

#### Deliverables:
- ✅ Socket.IO server integrated
- ✅ Chat interface (Islands architecture)
- ✅ OpenCode CLI integration working
- ✅ Session CRUD operations
- ✅ Message persistence in Deno KV
- ✅ Real-time sync between multiple clients
- ✅ AI processing indicators
- ✅ Cancel AI request functionality

#### Key Tasks:
```typescript
// Implement AI service
export async function processQuery(
  query: string,
  sessionId?: string
): Promise<{ response: string; sessionId: string }> {
  const command = new Deno.Command(OPENCODE_PATH, {
    args: sessionId 
      ? ["run", "--session", sessionId, `@darvis ${query}`]
      : ["run", "--agent", "darvis", query],
    stdout: "piped",
    stderr: "piped"
  });
  
  const { stdout, stderr } = await command.output();
  // Parse response and session ID
  // Return both
}
```

---

### Phase 3: Voice Features (Weeks 6-7)

**Goal:** Add voice recognition and TTS

#### Deliverables:
- ✅ Web Speech API integration
- ✅ Push-to-talk button component
- ✅ Voice input visual feedback
- ✅ TTS service with voice selection
- ✅ Speaking indicators
- ✅ Cross-browser compatibility tested
- ✅ Graceful degradation for unsupported browsers

#### Key Implementation:
```typescript
// Voice recognition island
export default function VoiceControl() {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser');
      return;
    }
    
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };
    
    recognition.start();
    setIsListening(true);
  };
  
  return (
    <button onClick={startListening} disabled={isListening}>
      {isListening ? '🎤 Listening...' : '🎙️ Push to Talk'}
    </button>
  );
}
```

---

### Phase 4: App Launcher (Week 8)

**Goal:** Implement application launching

#### Deliverables:
- ✅ `config/apps.json` with 50+ app definitions
- ✅ Platform detection (Linux, macOS, Windows)
- ✅ App finding logic (multi-tier detection)
- ✅ Web service launching (opens in browser)
- ✅ Desktop app launching (native execution)
- ✅ Security validation
- ✅ Launch feedback to user

#### Configuration Format:
```json
{
  "apps": [
    {
      "name": "firefox",
      "category": "desktop",
      "aliases": ["browser", "web browser"],
      "platform": "all",
      "detection": {
        "linux": {
          "desktop_file": "firefox.desktop",
          "paths": ["/usr/bin/firefox", "/usr/local/bin/firefox"]
        },
        "macos": {
          "bundle": "Firefox.app",
          "paths": ["/Applications", "/System/Applications"]
        },
        "windows": {
          "executable": "firefox.exe",
          "paths": ["C:\\Program Files\\Mozilla Firefox"]
        }
      }
    },
    {
      "name": "youtube",
      "category": "web",
      "url": "https://youtube.com",
      "aliases": ["yt", "videos"],
      "platform": "all"
    }
  ]
}
```

---

### Phase 5: Visual Design (Weeks 9-10)

**Goal:** Create polished UI with eye glow effect

#### Deliverables:
- ✅ Darvis logo component with Canvas-based eye glow
- ✅ Dark theme design system
- ✅ Responsive layouts (mobile, tablet, desktop)
- ✅ Session sidebar with icon rail
- ✅ Collapsible debug panel
- ✅ Loading and empty states
- ✅ Error messaging
- ✅ Visual regression tests

#### Eye Glow Implementation:
```typescript
// Port from Python PIL code
function renderEyeGlow(
  canvas: HTMLCanvasElement,
  glowColor: 'green' | 'red'
) {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  
  const eyePositions = [
    { x: canvas.width / 3, y: canvas.height / 2 },
    { x: (2 * canvas.width) / 3, y: canvas.height / 2 }
  ];
  
  const color = glowColor === 'green' 
    ? { r: 0, g: 255, b: 0 }
    : { r: 255, g: 0, b: 0 };
  
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      
      for (const eye of eyePositions) {
        const distance = Math.sqrt(
          Math.pow(x - eye.x, 2) + Math.pow(y - eye.y, 2)
        );
        
        if (distance < 30) { // Glow radius
          let blendFactor: number;
          
          if (distance <= 4) {
            // Inner glow (very bright)
            blendFactor = 1.0 - Math.pow(distance / 4, 0.5);
          } else {
            // Outer glow (exponential falloff)
            blendFactor = 0.6 * Math.pow(1 - (distance - 4) / 26, 0.7);
          }
          
          pixels[idx] = color.r * blendFactor + pixels[idx] * (1 - blendFactor);
          pixels[idx + 1] = color.g * blendFactor + pixels[idx + 1] * (1 - blendFactor);
          pixels[idx + 2] = color.b * blendFactor + pixels[idx + 2] * (1 - blendFactor);
        }
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}
```

---

### Phase 6: Desktop App (Weeks 11-12)

**Goal:** Build Tauri desktop application

#### Deliverables:
- ✅ Tauri project initialized in desktop/
- ✅ System tray integration (Rust)
- ✅ Show/hide window functionality
- ✅ Keyboard shortcut (Ctrl+Shift+D)
- ✅ Desktop-web WebSocket sync
- ✅ Native notifications
- ✅ Desktop build pipeline (GitHub Actions)
- ✅ Installation packages (.AppImage, .dmg, .exe)

#### Tauri Configuration:
```json
{
  "package": {
    "productName": "Darvis",
    "version": "1.0.0"
  },
  "build": {
    "distDir": "../web/dist",
    "devPath": "http://localhost:8000"
  },
  "tauri": {
    "systemTray": {
      "iconPath": "icons/icon.png"
    },
    "windows": [{
      "title": "Darvis Voice Assistant",
      "width": 1200,
      "height": 800,
      "resizable": true,
      "fullscreen": false
    }]
  }
}
```

---

### Phase 7: Testing & Polish (Weeks 13-14)

**Goal:** Comprehensive testing and quality assurance

#### Testing Targets:
- **Unit Tests:** 80%+ coverage
- **Integration Tests:** All API endpoints, Socket.IO events
- **E2E Tests:** Critical user journeys (auth, chat, voice, sync)
- **Visual Regression:** Logo states, layouts, responsive views
- **Security Audit:** Auth, XSS, CSRF, command injection
- **Performance:** Load times < 2s, TTI < 3s
- **Accessibility:** Lighthouse score > 90

#### Test Commands:
```bash
# Run all tests
deno task test

# Coverage report
deno task test:coverage

# E2E tests
deno task test:e2e

# Visual regression
npx percy exec -- deno task test:visual
```

---

### Phase 8: Deployment (Week 15)

**Goal:** Deploy to production

#### Deployment Checklist:
- [ ] Deno Deploy project created
- [ ] Custom domain configured (darvis.com)
- [ ] Environment variables set
- [ ] Database backups scheduled
- [ ] Logging and monitoring configured
- [ ] Web app deployed and tested
- [ ] Desktop builds published to GitHub Releases
- [ ] Documentation published
- [ ] v1.0.0 release created
- [ ] Launch announcement

#### Deno Deploy Setup:
```bash
deployctl link darvis-web
deployctl deploy --project=darvis-web --prod web/main.ts
```

---

## 🎯 Definition of Done

A feature is complete when:

### Code Quality
- [ ] TypeScript strict mode, no `any` types
- [ ] Formatted with `deno fmt`
- [ ] No linter errors
- [ ] JSDoc comments for public APIs

### Testing
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] E2E tests for user-facing features
- [ ] Visual regression tests for UI changes
- [ ] Manual testing on target platforms

### Documentation
- [ ] User documentation updated
- [ ] API documentation updated
- [ ] Code comments added
- [ ] CHANGELOG.md updated

### Security & Performance
- [ ] Security review completed
- [ ] Performance benchmarks met
- [ ] Accessibility checked
- [ ] Cross-browser tested

---

## 🚨 Risk Mitigation

### High-Risk Items

**1. OpenCode CLI on Deno Deploy**
- **Risk:** Serverless platform may not allow subprocess execution
- **Mitigation:**
  - Test early in Phase 2
  - Consider self-hosted deployment for full functionality
  - Document limitation if Deno Deploy blocks subprocesses

**2. App Launching on Serverless**
- **Risk:** Command execution requires system access
- **Mitigation:**
  - App launching only works in self-hosted or desktop app
  - Graceful degradation on Deno Deploy (show "not available")
  - Desktop app handles app launching via Tauri commands

**3. Web Speech API Browser Support**
- **Risk:** Firefox doesn't support Web Speech Recognition
- **Mitigation:**
  - Feature detection at runtime
  - Clear messaging for unsupported browsers
  - Recommend Chrome or Edge
  - Consider server-side fallback (future)

### Medium-Risk Items

**4. Database Migration from SQLite**
- **Risk:** Data loss or migration failure
- **Mitigation:**
  - Comprehensive migration script with validation
  - Backup Python database before migration
  - Test migration on sample data
  - Document rollback procedure

**5. Canvas Eye Glow Performance**
- **Risk:** Pixel manipulation may be slow on low-end devices
- **Mitigation:**
  - Start with Canvas implementation
  - Profile performance on various devices
  - Consider WebGL for GPU acceleration if needed
  - Add option to disable effect

---

## 🔮 Future Enhancements (Post-V1)

### v1.1 - v1.3 (Short-term)
- Voice customization (choose voice, speed, pitch)
- Keyboard shortcuts (Ctrl+Enter to send, etc.)
- Message editing and deletion
- Export chat history (JSON, Markdown, PDF)
- Search within conversations
- Dark/light theme toggle
- Custom wake words
- Internationalization (i18n)

### v2.0 - v2.5 (Medium-term)
- Mobile native apps (React Native or Flutter)
- Collaborative sessions (multi-user chats)
- Voice conversation mode (continuous back-and-forth)
- Plugin system for extensibility
- Multiple AI providers (OpenAI, Claude, Ollama)
- Browser extension (quick access)
- Advanced app automation (chains of commands)

### v3.0+ (Long-term)
- Smart home integration
- Calendar and email integration
- Proactive assistance (reminders, suggestions)
- Multi-modal input (image, file uploads)
- Screen sharing and annotation
- Team workspace features
- Enterprise SSO and admin panel

---

## 📚 Key Resources

### Documentation
- **Fresh Framework:** https://fresh.deno.dev
- **Deno Runtime:** https://deno.land/manual
- **Tauri:** https://tauri.app/v1/guides/
- **Deno KV:** https://deno.com/kv
- **Web Speech API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **Socket.IO:** https://socket.io/docs/v4/

### Current Darvis Codebase
- **Python Implementation:** /home/david/Code/github/darobbins85/darvis/
- **Key Modules:**
  - `darvis/speech.py` - Voice recognition and TTS
  - `darvis/ai.py` - OpenCode CLI integration
  - `darvis/apps.py` - App launching logic
  - `darvis/ui.py` - Tkinter GUI
  - `web_chat.py` - Flask-SocketIO server
  - `darvis/database.py` - SQLite operations

---

## ✅ Next Steps

### Immediate Actions
1. **Review and Approve Plan:** Team reviews this document, provides feedback
2. **Set Up Development Environment:** Install Deno, Tauri prerequisites
3. **Create Repository Structure:** Initialize monorepo with web/ and desktop/ folders
4. **Begin Phase 1:** Start with foundation (authentication, database, testing)

### Weekly Check-ins
- Review progress against roadmap
- Identify blockers and risks
- Adjust timeline as needed
- Document learnings and decisions

### Success Metrics
- On-time delivery of phases
- Test coverage targets met
- No critical security vulnerabilities
- User feedback positive
- Performance benchmarks achieved

---

## 📝 Document Metadata

**Version:** 1.0.0  
**Created:** 2026-04-05  
**Last Updated:** 2026-04-05  
**Status:** Approved for Implementation  
**Owner:** David Robbins  
**Stakeholders:** Development team, users, contributors

**Change Log:**
- 2026-04-05: Initial version created through professional planning session

---

**This document is the source of truth for the Darvis migration project. All team members and AI agents should reference this document for alignment across sessions.**

---

*Built with ❤️ for the Darvis community*
