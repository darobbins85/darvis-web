# 🔧 Darvis Migration - Technical Specifications

**Reference for AI agents and developers implementing the migration**

---

## 📊 Technology Stack

### Frontend
```yaml
Framework: Fresh (Deno)
Language: TypeScript (strict mode)
Styling: Tailwind CSS
State Management: Fresh Signals
Components: Custom (built from scratch)
Voice Input: Web Speech API (browser)
Voice Output: Web Speech Synthesis API (browser)
```

### Backend
```yaml
Runtime: Deno
Framework: Fresh
Database: Deno KV
Authentication: JWT + HTTP-only cookies
Real-time: Socket.IO
AI Integration: OpenCode CLI (subprocess)
App Launching: Deno.Command() (subprocess)
```

### Desktop
```yaml
Framework: Tauri
Backend: Rust
Frontend: Same as web (code reuse)
IPC: WebSocket to Deno server
System Tray: Tauri APIs
```

---

## 🗄️ Database Schema (Deno KV)

### Key Patterns

```typescript
// Users
["user", userId: string] → User

// User index (for login lookup)
["user_by_username", username: string] → userId

// Sessions
["session", sessionId: string] → Session

// User sessions index
["user_sessions", userId: string, sessionId: string] → null

// Messages (ordered by timestamp in key)
["message", sessionId: string, messageId: string] → Message

// Auth sessions (JWT tokens)
["auth_session", token: string] → AuthSession

// App cache (optional, for performance)
["app_cache", platform: string, appName: string] → AppDefinition
```

### Type Definitions

```typescript
interface User {
  id: string;                    // UUID
  username: string;              // Unique
  passwordHash: string;          // Bcrypt hash
  createdAt: Date;
}

interface Session {
  id: string;                    // UUID
  userId: string;                // Foreign key to User
  name: string;                  // Display name (e.g., "AI-abc123")
  aiSessionId?: string;          // OpenCode session ID
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  id: string;                    // UUID
  sessionId: string;             // Foreign key to Session
  role: 'user' | 'assistant';
  content: string;               // Message text
  createdAt: Date;
}

interface AuthSession {
  token: string;                 // JWT token
  userId: string;
  expiresAt: Date;               // 24 hours from creation
}

interface AppDefinition {
  name: string;                  // App identifier (lowercase)
  category: 'web' | 'desktop' | 'system';
  platform: 'linux' | 'macos' | 'windows' | 'all';
  aliases: string[];             // Alternative names
  command?: string;              // Executable command (desktop/system)
  url?: string;                  // URL (web services)
  detection?: {
    linux?: {
      desktop_file?: string;     // .desktop file name
      paths?: string[];          // Possible executable paths
    };
    macos?: {
      bundle?: string;           // .app bundle name
      paths?: string[];          // Search paths
    };
    windows?: {
      executable?: string;       // .exe name
      paths?: string[];          // Search paths
    };
  };
}
```

---

## 🔌 API Endpoints

### Authentication

```typescript
POST /api/auth/signup
Body: { username: string, password: string }
Response: { user: User, token: string }

POST /api/auth/login
Body: { username: string, password: string }
Response: { user: User, token: string }
Sets: HTTP-only cookie with JWT

POST /api/auth/logout
Headers: Authorization: Bearer <token>
Response: { success: true }
Clears: Cookie

GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user: User }
```

### Sessions

```typescript
GET /api/sessions
Headers: Authorization: Bearer <token>
Response: { sessions: Session[] }

POST /api/sessions
Headers: Authorization: Bearer <token>
Body: { name?: string }
Response: { session: Session }

GET /api/sessions/:id
Headers: Authorization: Bearer <token>
Response: { session: Session }

PUT /api/sessions/:id
Headers: Authorization: Bearer <token>
Body: { name: string }
Response: { session: Session }

DELETE /api/sessions/:id
Headers: Authorization: Bearer <token>
Response: { success: true }
```

### Messages

```typescript
GET /api/sessions/:id/messages
Headers: Authorization: Bearer <token>
Query: ?offset=0&limit=50
Response: { messages: Message[], hasMore: boolean }

POST /api/messages
Headers: Authorization: Bearer <token>
Body: { sessionId: string, content: string }
Response: { message: Message }
Note: Prefer Socket.IO for real-time messaging
```

### System

```typescript
GET /api/health
Response: {
  status: "ok" | "error",
  timestamp: string,
  uptime: number,
  memory: { heapUsed: number, heapTotal: number },
  database: { connected: boolean },
  opencode: { available: boolean }
}

GET /api/apps
Response: { apps: AppDefinition[] }

POST /api/apps/launch
Headers: Authorization: Bearer <token>
Body: { appName: string }
Response: { success: boolean, message: string }
```

---

## 🔌 Socket.IO Events

### Connection Events

```typescript
// Client connects
'connect'
Server assigns to user-specific room

// Client disconnects
'disconnect'
Server cleans up
```

### Chat Events

```typescript
// Client → Server: Send message
'chat_message'
Payload: { sessionId: string, content: string }

// Server → Clients: User message broadcast
'user_message'
Payload: Message

// Server → Clients: AI processing status
'ai_processing'
Payload: { isProcessing: boolean, sessionId: string }

// Server → Clients: AI response
'ai_message'
Payload: Message

// Client → Server: Cancel AI request
'cancel_request'
Payload: { sessionId: string }
```

### Voice Events (optional, for future server-side voice)

```typescript
// Client → Server: Voice listening state
'toggle_listening'
Payload: { isListening: boolean }

// Client → Server: Request TTS
'request_tts'
Payload: { text: string }
```

### Session Events

```typescript
// Server → Clients: Session updated
'session_update'
Payload: Session

// Server → Clients: Error occurred
'error'
Payload: { message: string, code: string }
```

---

## 🎨 UI Component Structure

### Fresh Routes (Server-Side)

```
routes/
├── index.tsx              # Home/Chat page (requires auth)
├── login.tsx              # Login page
├── signup.tsx             # Signup page
├── _middleware.ts         # Auth middleware
├── _app.tsx               # App wrapper (layout, theme)
└── api/
    ├── auth.ts            # Auth endpoints
    ├── sessions.ts        # Session endpoints
    ├── messages.ts        # Message endpoints
    └── health.ts          # Health check
```

### Fresh Islands (Client-Side Interactive)

```
islands/
├── ChatInterface.tsx      # Main chat container
├── VoiceControl.tsx       # Push-to-talk button
├── DarvisLogo.tsx         # Animated logo with eye glow
├── SessionSidebar.tsx     # Session list and management
├── DebugPanel.tsx         # Collapsible debug logs
└── MessageList.tsx        # Scrollable message history
```

### Shared Components (Server-Side)

```
components/
├── Header.tsx             # App header (user info, settings)
├── Layout.tsx             # Page layout wrapper
├── Button.tsx             # Reusable button component
├── Input.tsx              # Reusable input component
└── ThemeProvider.tsx      # Dark theme context
```

---

## 🎨 Design System

### Colors (Tailwind)

```typescript
const colors = {
  background: '#0f1419',      // Dark background
  surface: '#1a1f29',         // Lighter surface
  primary: '#00d4aa',         // Teal (Darvis brand)
  success: '#10b981',         // Green
  error: '#ef4444',           // Red
  warning: '#f59e0b',         // Orange
  text: '#f9fafb',            // Off-white
  textSecondary: '#9ca3af',   // Gray
};
```

### Typography

```typescript
const typography = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};
```

### Spacing (8px grid)

```typescript
const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
};
```

### Responsive Breakpoints

```typescript
const breakpoints = {
  sm: '640px',    // Mobile landscape, small tablets
  md: '768px',    // Tablets
  lg: '1024px',   // Desktops
  xl: '1280px',   // Large desktops
};
```

---

## 🎤 Voice Implementation

### Web Speech Recognition

```typescript
// Check browser support
const isSupported = 'webkitSpeechRecognition' in window;

// Initialize recognition
const recognition = new webkitSpeechRecognition();
recognition.continuous = false;      // Single phrase
recognition.interimResults = false;  // Only final results
recognition.lang = 'en-US';

// Event handlers
recognition.onresult = (event: SpeechRecognitionEvent) => {
  const transcript = event.results[0][0].transcript;
  const confidence = event.results[0][0].confidence;
  console.log(`Recognized: ${transcript} (${confidence})`);
};

recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
  console.error('Recognition error:', event.error);
};

recognition.onend = () => {
  console.log('Recognition ended');
};

// Start/stop
recognition.start();
recognition.stop();
```

### Web Speech Synthesis

```typescript
// Check browser support
const isSupported = 'speechSynthesis' in window;

// Get available voices
const voices = speechSynthesis.getVoices();

// Speak text
const utterance = new SpeechSynthesisUtterance('Hello, I am Darvis');
utterance.voice = voices[0];        // Select voice
utterance.rate = 1.0;               // Speed (0.1 - 10)
utterance.pitch = 1.0;              // Pitch (0 - 2)
utterance.volume = 1.0;             // Volume (0 - 1)

utterance.onstart = () => console.log('Speaking started');
utterance.onend = () => console.log('Speaking ended');

speechSynthesis.speak(utterance);

// Stop speaking
speechSynthesis.cancel();
```

---

## 🤖 AI Integration (OpenCode CLI)

### Process Execution

```typescript
import { OpenCodeService } from './ai.ts';

// Initialize service
const aiService = new OpenCodeService({
  opencodePath: Deno.env.get('OPENCODE_PATH') || 
                '/home/user/.opencode/bin/opencode',
  timeout: 300000,  // 5 minutes
});

// Process query
const result = await aiService.processQuery(
  'What is 2 + 2?',
  sessionId // optional, for continuity
);

console.log(result.response);    // "4"
console.log(result.sessionId);   // "abc123..."
```

### Implementation

```typescript
export class OpenCodeService {
  private currentProcess: Deno.ChildProcess | null = null;
  
  async processQuery(
    query: string,
    sessionId?: string
  ): Promise<{ response: string; sessionId: string }> {
    const args = sessionId
      ? ['run', '--session', sessionId, `@darvis ${query}`]
      : ['run', '--agent', 'darvis', query];
    
    const command = new Deno.Command(this.opencodePath, {
      args,
      stdout: 'piped',
      stderr: 'piped',
    });
    
    this.currentProcess = command.spawn();
    
    const { stdout, stderr } = await this.currentProcess.output();
    this.currentProcess = null;
    
    if (!stdout) {
      throw new Error('OpenCode returned no output');
    }
    
    const output = new TextDecoder().decode(stdout);
    
    // Parse response and extract session ID
    // OpenCode output format: response text followed by session ID
    const lines = output.trim().split('\n');
    const response = lines.slice(0, -1).join('\n');
    const newSessionId = lines[lines.length - 1];
    
    return { response, sessionId: newSessionId || sessionId || '' };
  }
  
  async cancel(): Promise<boolean> {
    if (this.currentProcess) {
      try {
        this.currentProcess.kill('SIGTERM');
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}
```

---

## 🚀 App Launcher Implementation

### Configuration (config/apps.json)

```json
{
  "apps": [
    {
      "name": "calculator",
      "category": "system",
      "aliases": ["calc", "calculator"],
      "platform": "all",
      "detection": {
        "linux": {
          "paths": ["/usr/bin/gnome-calculator", "/usr/bin/kcalc"]
        },
        "macos": {
          "bundle": "Calculator.app"
        },
        "windows": {
          "executable": "calc.exe"
        }
      }
    }
  ]
}
```

### Service Implementation

```typescript
export class AppLauncher {
  private apps: AppDefinition[];
  private platform: 'linux' | 'macos' | 'windows';
  
  async findApp(appName: string): Promise<AppDefinition | null> {
    const query = appName.toLowerCase();
    
    // Find by name or alias
    const app = this.apps.find(
      (a) => a.name === query || a.aliases.includes(query)
    );
    
    if (!app) return null;
    
    // Check platform compatibility
    if (app.platform !== 'all' && app.platform !== this.platform) {
      return null;
    }
    
    return app;
  }
  
  async launch(appName: string): Promise<{ success: boolean; message: string }> {
    const app = await this.findApp(appName);
    
    if (!app) {
      return { success: false, message: `App "${appName}" not found` };
    }
    
    try {
      if (app.category === 'web') {
        // Open URL in browser
        const command = this.platform === 'macos' ? 'open' : 'xdg-open';
        await new Deno.Command(command, { args: [app.url!] }).output();
      } else {
        // Launch desktop app
        const command = await this.resolveCommand(app);
        if (!command) {
          return { success: false, message: `Command not found for ${appName}` };
        }
        
        await new Deno.Command(command, { args: [] }).spawn();
      }
      
      return { success: true, message: `Launched ${app.name}` };
    } catch (error) {
      return { success: false, message: `Failed to launch: ${error.message}` };
    }
  }
  
  private async resolveCommand(app: AppDefinition): Promise<string | null> {
    const detection = app.detection?.[this.platform];
    if (!detection) return null;
    
    // Try .desktop file (Linux)
    if (detection.desktop_file) {
      const desktopDirs = [
        '/usr/share/applications',
        '/usr/local/share/applications',
        Deno.env.get('HOME') + '/.local/share/applications',
      ];
      
      for (const dir of desktopDirs) {
        const path = `${dir}/${detection.desktop_file}`;
        try {
          const content = await Deno.readTextFile(path);
          const execLine = content.match(/^Exec=(.+)$/m);
          if (execLine) {
            return execLine[1].split(' ')[0]; // Extract command
          }
        } catch {
          continue;
        }
      }
    }
    
    // Try paths
    if (detection.paths) {
      for (const path of detection.paths) {
        try {
          await Deno.stat(path);
          return path;
        } catch {
          continue;
        }
      }
    }
    
    return null;
  }
}
```

---

## 🎨 Eye Glow Effect (Canvas)

### Implementation

```typescript
interface Point {
  x: number;
  y: number;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

export class DarvisLogoRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private baseImage: ImageData;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    // Load and cache base image
    const img = new Image();
    img.onload = () => {
      this.ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      this.baseImage = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    };
    img.src = '/static/logo.png';
  }
  
  renderGlow(color: 'green' | 'red', duration: number = 3000) {
    const glowColor: RGB = color === 'green'
      ? { r: 0, g: 255, b: 0 }
      : { r: 255, g: 0, b: 0 };
    
    // Calculate eye positions (thirds of width)
    const eyePositions: Point[] = [
      { x: this.canvas.width / 3, y: this.canvas.height / 2 },
      { x: (2 * this.canvas.width) / 3, y: this.canvas.height / 2 },
    ];
    
    // Create glow image
    const glowImage = this.createGlowImage(eyePositions, glowColor);
    
    // Render
    this.ctx.putImageData(glowImage, 0, 0);
    
    // Auto-reset after duration
    setTimeout(() => this.renderNormal(), duration);
  }
  
  renderNormal() {
    this.ctx.putImageData(this.baseImage, 0, 0);
  }
  
  private createGlowImage(eyes: Point[], glowColor: RGB): ImageData {
    const imageData = this.ctx.createImageData(
      this.baseImage.width,
      this.baseImage.height
    );
    
    const pixels = imageData.data;
    const basePixels = this.baseImage.data;
    
    for (let y = 0; y < this.canvas.height; y++) {
      for (let x = 0; x < this.canvas.width; x++) {
        const idx = (y * this.canvas.width + x) * 4;
        
        // Copy base pixel
        pixels[idx] = basePixels[idx];
        pixels[idx + 1] = basePixels[idx + 1];
        pixels[idx + 2] = basePixels[idx + 2];
        pixels[idx + 3] = basePixels[idx + 3];
        
        // Apply glow from each eye
        for (const eye of eyes) {
          const distance = Math.sqrt(
            Math.pow(x - eye.x, 2) + Math.pow(y - eye.y, 2)
          );
          
          if (distance < 30) { // Glow radius
            const blendFactor = this.calculateBlendFactor(distance);
            
            pixels[idx] = glowColor.r * blendFactor + pixels[idx] * (1 - blendFactor);
            pixels[idx + 1] = glowColor.g * blendFactor + pixels[idx + 1] * (1 - blendFactor);
            pixels[idx + 2] = glowColor.b * blendFactor + pixels[idx + 2] * (1 - blendFactor);
          }
        }
      }
    }
    
    return imageData;
  }
  
  private calculateBlendFactor(distance: number): number {
    if (distance <= 4) {
      // Inner glow (very bright)
      return 1.0 - Math.pow(distance / 4, 0.5);
    } else {
      // Outer glow (exponential falloff)
      return 0.6 * Math.pow(1 - (distance - 4) / 26, 0.7);
    }
  }
}
```

---

## 🔒 Security Implementation

### Password Hashing

```typescript
import * as bcrypt from 'https://deno.land/x/bcrypt/mod.ts';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12); // 12 rounds
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
```

### JWT Tokens

```typescript
import { create, verify } from 'https://deno.land/x/djwt/mod.ts';

const JWT_SECRET = Deno.env.get('JWT_SECRET')!;
const key = await crypto.subtle.importKey(
  'raw',
  new TextEncoder().encode(JWT_SECRET),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign', 'verify']
);

export async function createToken(userId: string): Promise<string> {
  return await create(
    { alg: 'HS256', typ: 'JWT' },
    { userId, exp: Date.now() + 24 * 60 * 60 * 1000 }, // 24h
    key
  );
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const payload = await verify(token, key);
    return payload.userId as string;
  } catch {
    return null;
  }
}
```

### Auth Middleware

```typescript
import { MiddlewareHandlerContext } from 'fresh/server.ts';

export async function authMiddleware(
  req: Request,
  ctx: MiddlewareHandlerContext
) {
  const token = getCookie(req.headers, 'auth_token');
  
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const userId = await verifyToken(token);
  
  if (!userId) {
    return new Response('Invalid token', { status: 401 });
  }
  
  // Attach user to context
  ctx.state.userId = userId;
  
  return await ctx.next();
}
```

---

## 📝 File Structure Conventions

### Naming
- **Routes:** kebab-case (e.g., `user-settings.tsx`)
- **Components:** PascalCase (e.g., `ChatInterface.tsx`)
- **Utilities:** camelCase (e.g., `formatDate.ts`)
- **Types:** PascalCase (e.g., `User.ts`)

### Imports
```typescript
// Order: std library → external → internal
import { serve } from 'https://deno.land/std/http/server.ts';
import { z } from 'https://deno.land/x/zod/mod.ts';
import { createUser } from '@/lib/db.ts';
```

### Exports
```typescript
// Prefer named exports
export function createUser() { }
export const DEFAULT_CONFIG = { };

// Default export for components
export default function ChatInterface() { }
```

---

**Last Updated:** 2026-04-05  
**Version:** 1.0.0
