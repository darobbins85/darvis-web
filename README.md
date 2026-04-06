# Darvis Web - Voice Assistant

Modern TypeScript/Deno web application for Darvis Voice Assistant.

## Status

✅ **Phase 1: Foundation** - COMPLETE (70/70 tests passing)

## Features

- ✅ Fresh framework with Tailwind CSS configured
- ✅ Deno KV database layer with full test coverage
- ✅ JWT authentication system with bcrypt password hashing
- ✅ RESTful API routes for authentication
- ✅ TypeScript strict mode with comprehensive types
- ✅ GitHub Actions CI/CD pipeline
- ⏳ Chat interface (Phase 2)
- ⏳ AI integration (Phase 2)
- ⏳ Voice input/output (Phase 3)

## Prerequisites

- Deno 2.x+ (installed at `~/.deno/bin/deno`)
- Rust/Cargo (for Tauri desktop app, coming in Phase 6)

## Quick Start

```bash
# Clone repository
git clone git@github.com:darobbins85/darvis-web.git
cd darvis-web

# Set up environment variables
cp .env.example .env
# Edit .env and add your JWT_SECRET

# Run tests
~/.deno/bin/deno task test

# Development server
~/.deno/bin/deno task dev

# Format code
~/.deno/bin/deno task fmt

# Lint code
~/.deno/bin/deno task lint
```

## Environment Variables

Create a `.env` file in the project root:

```env
JWT_SECRET=your-secret-key-here-min-32-characters
DENO_KV_URL=  # Leave empty for local development
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

- ✅ **Phase 1:** Foundation - COMPLETE
  - Fresh framework setup
  - Deno KV database layer
  - JWT authentication
  - API routes
  - CI/CD pipeline
  - 70/70 tests passing
- 🚧 **Phase 2:** Core Features (Next - Chat UI, AI integration)
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
