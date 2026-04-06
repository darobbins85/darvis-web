import { Handlers } from "$fresh/server.ts";
import { getCurrentUser } from "../../../lib/auth.ts";
import { deleteSession, getSessionById, updateSessionName } from "../../../lib/db.ts";
import type { ApiResponse } from "../../../types/index.ts";

// GET /api/sessions/:id - Get session by ID
// PUT /api/sessions/:id - Update session name
// DELETE /api/sessions/:id - Delete session
export const handler: Handlers = {
  async GET(req, ctx) {
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

    // Get session by ID
    const sessionId = ctx.params.id;
    const session = await getSessionById(sessionId);

    if (!session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify session belongs to user
    if (session.userId !== user.id) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const response: ApiResponse = { session };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },

  async PUT(req, ctx) {
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

    // Get session by ID
    const sessionId = ctx.params.id;
    const session = await getSessionById(sessionId);

    if (!session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify session belongs to user
    if (session.userId !== user.id) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
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

    // Validate name
    if (!body?.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Name is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update session
    const updatedSession = await updateSessionName(sessionId, body.name.trim());

    if (!updatedSession) {
      return new Response(
        JSON.stringify({ error: "Failed to update session" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const response: ApiResponse = { session: updatedSession };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },

  async DELETE(req, ctx) {
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

    // Get session by ID
    const sessionId = ctx.params.id;
    const session = await getSessionById(sessionId);

    if (!session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify session belongs to user
    if (session.userId !== user.id) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Delete session
    const deleted = await deleteSession(sessionId);

    if (!deleted) {
      return new Response(
        JSON.stringify({ error: "Failed to delete session" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const response: ApiResponse = { success: true };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
};
