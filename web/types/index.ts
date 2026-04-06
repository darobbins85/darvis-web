/**
 * TypeScript Type Definitions for Darvis Web
 * 
 * Defines all data structures used across the application.
 * All types enforce strict typing for better code quality.
 */

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * User account
 */
export interface User {
  /** Unique user identifier (UUID) */
  id: string;
  
  /** Username (unique, 3+ characters) */
  username: string;
  
  /** Bcrypt hashed password (never sent to client) */
  passwordHash: string;
  
  /** Account creation timestamp */
  createdAt: Date;
}

/**
 * Safe user object (without password hash) for API responses
 */
export type SafeUser = Omit<User, "passwordHash">;

// ============================================================================
// SESSION TYPES
// ============================================================================

/**
 * Chat session
 */
export interface Session {
  /** Unique session identifier (UUID) */
  id: string;
  
  /** Owner user ID */
  userId: string;
  
  /** Session display name */
  name: string;
  
  /** Linked OpenCode AI session ID (optional) */
  aiSessionId?: string;
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Last update timestamp (updated on new messages) */
  updatedAt: Date;
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

/**
 * Message role (user or AI assistant)
 */
export type MessageRole = "user" | "assistant";

/**
 * Chat message
 */
export interface Message {
  /** Unique message identifier (UUID) */
  id: string;
  
  /** Parent session ID */
  sessionId: string;
  
  /** Message author role */
  role: MessageRole;
  
  /** Message content (text) */
  content: string;
  
  /** Creation timestamp */
  createdAt: Date;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

/**
 * Authentication session (JWT token tracking)
 */
export interface AuthSession {
  /** JWT token */
  token: string;
  
  /** Associated user ID */
  userId: string;
  
  /** Expiration timestamp (24 hours from creation) */
  expiresAt: Date;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Signup request payload
 */
export interface SignupRequest {
  username: string;
  password: string;
}

/**
 * Auth response payload
 */
export interface AuthResponse {
  user: SafeUser;
  token: string;
}

// ============================================================================
// API TYPES
// ============================================================================

/**
 * Standard API error response
 */
export interface ApiError {
  /** Error message */
  error: string;
  
  /** Optional error code for client handling */
  code?: string;
}

/**
 * Standard API success response
 */
export interface ApiSuccess<T = unknown> {
  /** Success flag */
  success: true;
  
  /** Response data */
  data: T;
}

/**
 * API response type (success or error)
 */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ============================================================================
// APP TYPES
// ============================================================================

/**
 * Application category
 */
export type AppCategory = "web" | "desktop" | "system";

/**
 * Platform identifier
 */
export type Platform = "linux" | "macos" | "windows" | "all";

/**
 * Application definition (for app launcher)
 */
export interface AppDefinition {
  /** App identifier (lowercase) */
  name: string;
  
  /** App category */
  category: AppCategory;
  
  /** Supported platform(s) */
  platform: Platform;
  
  /** Alternative names for launching */
  aliases: string[];
  
  /** Executable command (desktop/system apps) */
  command?: string;
  
  /** URL (web services) */
  url?: string;
  
  /** Platform-specific detection config */
  detection?: {
    linux?: {
      desktop_file?: string;
      paths?: string[];
    };
    macos?: {
      bundle?: string;
      paths?: string[];
    };
    windows?: {
      executable?: string;
      paths?: string[];
    };
  };
}

// ============================================================================
// SOCKET.IO EVENT TYPES
// ============================================================================

/**
 * Socket.IO client-to-server events
 */
export interface ClientToServerEvents {
  /** User sends a chat message */
  chat_message: (data: { sessionId: string; content: string }) => void;
  
  /** User toggles voice listening state */
  toggle_listening: (isListening: boolean) => void;
  
  /** User cancels AI request */
  cancel_request: (data: { sessionId: string }) => void;
}

/**
 * Socket.IO server-to-client events
 */
export interface ServerToClientEvents {
  /** Broadcast user message to all clients */
  user_message: (message: Message) => void;
  
  /** Broadcast AI response to all clients */
  ai_message: (message: Message) => void;
  
  /** Broadcast AI processing state */
  ai_processing: (data: { isProcessing: boolean; sessionId: string }) => void;
  
  /** Session was updated */
  session_update: (session: Session) => void;
  
  /** Error occurred */
  error: (error: ApiError) => void;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if response is an error
 */
export function isApiError(response: unknown): response is ApiError {
  return typeof response === "object" &&
    response !== null &&
    "error" in response &&
    typeof (response as ApiError).error === "string";
}

/**
 * Type guard to check if response is success
 */
export function isApiSuccess<T>(response: unknown): response is ApiSuccess<T> {
  return typeof response === "object" &&
    response !== null &&
    "success" in response &&
    (response as ApiSuccess<T>).success === true;
}
