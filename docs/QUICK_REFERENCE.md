# 🚀 Darvis Migration - Quick Reference

**Full Plan:** See `MIGRATION_PLAN.md` for complete details

---

## ⚡ Quick Overview

**Goal:** Migrate Darvis from Python/Flask/Tkinter → TypeScript/Deno/Fresh/Tauri

**Timeline:** 15 weeks  
**Target:** Production-ready v1.0.0

---

## 🎯 Key Decisions (from Planning Session)

### Architecture
- **Web Framework:** Fresh (Deno-native)
- **Desktop App:** Tauri (Rust + Web)
- **Database:** Deno KV (cloud-synced)
- **Styling:** Tailwind CSS (utility-first)
- **UI Components:** Custom from scratch
- **Repository:** Monorepo (web/ and desktop/ folders)

### Features
- **Voice Input:** Web Speech API (browser) + Push-to-talk button
- **Voice Output:** Web Speech Synthesis API (browser)
- **AI Integration:** OpenCode CLI via Deno.Command() (same as current)
- **App Launching:** Keep full functionality (50+ apps)
- **Authentication:** Multi-user with JWT + HTTP-only cookies
- **Real-time:** Socket.IO (same as current)
- **Desktop-Web Sync:** Full real-time synchronization
- **Visual Effect:** Canvas-based eye glow (port from Python)
- **System Tray:** Tauri cross-platform (generalized from Waybar)

### Development
- **TypeScript:** Strict mode (no `any`)
- **Formatting:** deno fmt (built-in)
- **Linting:** deno lint (built-in)
- **Testing:** Full suite (unit, integration, E2E, visual)
- **Deployment:** Deno Deploy (web) + GitHub Releases (desktop)
- **Config Management:** Environment variables (.env)
- **Logging:** File-based with rotation
- **Versioning:** Semantic versioning + git tags

---

## 📦 Project Structure

```
darvis/
├── web/                    # Fresh web app
│   ├── routes/            # File-based routing
│   ├── islands/           # Client-side components
│   ├── lib/               # Core services (AI, apps, auth, db)
│   └── static/            # Assets (logo, CSS)
├── desktop/                # Tauri desktop app
│   ├── src-tauri/         # Rust backend
│   └── src/               # Web frontend (reuses web/)
├── shared/                 # Shared types and utils
├── config/                 # JSON configurations (apps, wake words)
├── tests/                  # Unit, integration, E2E, visual tests
├── scripts/                # Build and deployment scripts
└── docs/                   # Documentation
```

---

## 🗓️ 15-Week Roadmap

### Phase 1: Foundation (Weeks 1-2)
- Set up monorepo, Fresh, Tailwind
- Authentication (signup, login, JWT)
- Deno KV database
- Testing infrastructure, CI/CD

### Phase 2: Core Features (Weeks 3-5)
- Socket.IO server
- Chat interface
- OpenCode CLI integration
- Session and message management
- Real-time sync

### Phase 3: Voice Features (Weeks 6-7)
- Web Speech API integration
- Push-to-talk button
- TTS service
- Cross-browser testing

### Phase 4: App Launcher (Week 8)
- Port apps.json (50+ apps)
- Platform detection
- App launching via Deno.Command()
- Security validation

### Phase 5: Visual Design (Weeks 9-10)
- Darvis logo with Canvas eye glow
- Dark theme design system
- Responsive layouts
- Session sidebar, debug panel
- Visual regression tests

### Phase 6: Desktop App (Weeks 11-12)
- Tauri project setup
- System tray integration
- Desktop-web WebSocket sync
- Build pipeline for Linux, macOS, Windows

### Phase 7: Testing & Polish (Weeks 13-14)
- Complete test suite (80%+ coverage)
- Security audit
- Performance optimization
- Accessibility audit
- Bug fixes

### Phase 8: Deployment (Week 15)
- Deploy to Deno Deploy
- Configure custom domain
- Publish desktop apps
- Documentation
- v1.0.0 release

---

## 🎨 Current Features to Migrate

From Python version (10+ features):

1. ✅ Voice recognition (wake word detection)
2. ✅ Text-to-speech
3. ✅ AI integration (OpenCode CLI)
4. ✅ App launching (50+ apps)
5. ✅ Multi-user authentication
6. ✅ Session management
7. ✅ Real-time desktop-web sync
8. ✅ Eye glow visual effect (green=wake, red=AI)
9. ✅ Desktop GUI with system tray
10. ✅ Web interface (dark theme)
11. ✅ Waybar integration → System tray (generalized)
12. ✅ Cross-platform (Linux, macOS, Windows)

---

## 🔐 Security Highlights

- **Passwords:** Bcrypt hashing (12 rounds)
- **Sessions:** JWT tokens in HTTP-only cookies
- **Authorization:** User-scoped database queries
- **App Launching:** Whitelist approach, no arbitrary commands
- **XSS:** Input sanitization, CSP headers
- **CSRF:** SameSite cookies

---

## 🧪 Testing Strategy

- **Unit Tests:** 80%+ coverage (Deno Test)
- **Integration Tests:** API endpoints, Socket.IO events
- **E2E Tests:** User journeys (Playwright)
- **Visual Regression:** Logo states, layouts (Percy/Chromatic)

---

## 🚨 Risk Awareness

### High-Risk
1. **OpenCode CLI on Deno Deploy** - May not allow subprocess execution
   - **Mitigation:** Test early, consider self-hosted deployment
2. **App Launching on Serverless** - Requires system access
   - **Mitigation:** Desktop app handles this, web gracefully degrades
3. **Browser Speech API** - Firefox doesn't support recognition
   - **Mitigation:** Feature detection, recommend Chrome/Edge

### Medium-Risk
4. **Database Migration** - SQLite → Deno KV
   - **Mitigation:** Migration script, backup original, test thoroughly

---

## 📝 Commands Reference

### Development
```bash
deno task dev              # Start web dev server (hot reload)
deno task dev:all          # Start web + desktop
deno task fmt              # Format code
deno task lint             # Lint code
deno task test             # Run all tests
deno task test:coverage    # Run with coverage report
```

### Building
```bash
deno task build            # Build web app for production
deno task build:desktop    # Build Tauri desktop apps
```

### Deployment
```bash
deno task deploy           # Deploy web app to Deno Deploy
```

---

## 🌐 Deployment

### Web App
- **Platform:** Deno Deploy (serverless)
- **URL:** darvis.com (custom domain)
- **Database:** Deno KV (auto-configured)
- **CI/CD:** GitHub Actions (auto-deploy on main branch push)

### Desktop App
- **Platforms:** Linux (.AppImage, .deb), macOS (.dmg), Windows (.exe, .msi)
- **Distribution:** GitHub Releases
- **Build:** GitHub Actions (multi-platform matrix)

---

## 📚 Essential Links

- **Full Migration Plan:** `.opencode/plans/MIGRATION_PLAN.md`
- **Current Python Codebase:** `/home/david/Code/github/darobbins85/darvis/`
- **Fresh Docs:** https://fresh.deno.dev
- **Deno Manual:** https://deno.land/manual
- **Tauri Docs:** https://tauri.app/v1/guides/

---

## ✅ Getting Started

1. Review full `MIGRATION_PLAN.md`
2. Set up development environment (Deno, Rust)
3. Initialize monorepo structure
4. Begin Phase 1: Foundation

---

**Last Updated:** 2026-04-05  
**Status:** Ready for Implementation
