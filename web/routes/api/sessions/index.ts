import { Handlers } from "$fresh/server.ts";
import { getCurrentUser } from "../../../lib/auth.ts";
import { createSession, getUserSessions } from "../../../lib/db.ts";
import type { ApiResponse } from "../../../types/index.ts";

// GET /api/sessions - Get all sessions for current user
// POST /api/sessions - Create new session
export const handler: Handlers = {
  async GET(req) {
    // Get current user from auth token
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") || "";
    const user = await getCurrentUser(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get all sessions for user
    const sessions = await getUserSessions(user.id);

    const response: ApiResponse = { sessions };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },

  async POST(req) {
    // Get current user from auth token
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") || "";
    const user = await getCurrentUser(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create session with optional custom name
    const session = await createSession(user.id, body?.name);

    const response: ApiResponse = { session };
    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  },
};
