import { Handlers } from "$fresh/server.ts";
import { getCurrentUser } from "../../../lib/auth.ts";
import { addMessage, getSession } from "../../../lib/db.ts";
import type { ApiResponse } from "../../../types/index.ts";

// POST /api/messages - Create new message
export const handler: Handlers = {
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

    // Validate input
    if (!body?.sessionId || !body?.content) {
      return new Response(
        JSON.stringify({ error: "sessionId and content are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (typeof body.content !== "string" || body.content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "content must be a non-empty string" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify session exists and belongs to user
    const session = await getSession(body.sessionId);

    if (!session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (session.userId !== user.id) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create message
    const message = await addMessage(body.sessionId, "user", body.content.trim());

    const response: ApiResponse = { message };
    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  },
};
