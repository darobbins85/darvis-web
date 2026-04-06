#!/bin/bash

# Darvis Web Server Launcher
# Starts the Fresh server in production mode

echo "🚀 Starting Darvis Web Server..."
echo ""
echo "Server will be available at: http://localhost:8000"
echo ""
echo "Pages:"
echo "  - http://localhost:8000/signup  (Create account)"
echo "  - http://localhost:8000/login   (Sign in)"
echo "  - http://localhost:8000/chat    (Chat interface)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$(dirname "$0")"
~/.deno/bin/deno task start
