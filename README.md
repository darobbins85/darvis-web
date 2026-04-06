# Darvis Web - Voice Assistant

Modern TypeScript/Deno web application for Darvis Voice Assistant.

## Status

🚧 **Phase 1: Foundation** - In Progress

## Features (In Development)

- ⏳ Fresh framework with Tailwind CSS
- ⏳ Deno KV database layer
- ⏳ JWT authentication system
- ⏳ API routes for auth
- ⏳ 100% test coverage
- ⏳ CI/CD pipeline

## Prerequisites

- Deno 2.x+ (installed at `~/.deno/bin/deno`)
- Rust/Cargo (for Tauri desktop app, coming in Phase 6)

## Quick Start

```bash
# Clone repository
git clone git@github.com:darobbins85/darvis-web.git
cd darvis-web

# Development server (after Fresh is set up)
~/.deno/bin/deno task dev

# Run tests (after tests are written)
~/.deno/bin/deno task test
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
│   ├── static/           # Static assets
│   └── types/            # TypeScript types
├── tests/                 # Test suite
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   ├── e2e/              # End-to-end tests
│   └── visual/           # Visual regression tests
├── desktop/               # Tauri desktop app (Phase 6)
├── shared/                # Shared code
├── config/                # Configuration files
├── docs/                  # Documentation
└── assets/                # Logo and visual assets
```

## Documentation

- **Migration Plan:** `docs/MIGRATION_PLAN.md`
- **Technical Specs:** `docs/TECHNICAL_SPECS.md`
- **Quick Reference:** `docs/QUICK_REFERENCE.md`

## Roadmap

- 🚧 **Phase 1:** Foundation (Current)
- ⏳ **Phase 2:** Core Features (Chat, AI integration)
- ⏳ **Phase 3:** Voice Features (Web Speech API)
- ⏳ **Phase 4:** App Launcher
- ⏳ **Phase 5:** Visual Design (Eye glow effect)
- ⏳ **Phase 6:** Desktop App (Tauri)
- ⏳ **Phase 7:** Testing & Polish
- ⏳ **Phase 8:** Deployment

## License

MIT - See LICENSE file

---

**Built with ❤️ for the voice assistant community**
