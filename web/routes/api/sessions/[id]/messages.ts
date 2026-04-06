import { Handlers } from "$fresh/server.ts";
import { getCurrentUser } from "../../../../lib/auth.ts";
import { getSessionById, getSessionMessages } from "../../../../lib/db.ts";
import type { ApiResponse } from "../../../../types/index.ts";

// GET /api/sessions/:id/messages - Get messages for session
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

    // Get messages for session
    const messages = await getSessionMessages(sessionId);

    const response: ApiResponse = { messages };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
};
