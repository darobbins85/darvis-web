import { Handlers } from "$fresh/server.ts";
import { getCurrentUser } from "../../lib/auth.ts";
import { addMessage, getSessionById, getSessionMessages } from "../../lib/db.ts";
import {
  buildConversationHistory,
  DARVIS_SYSTEM_PROMPT,
  getAiCompletionStream,
} from "../../lib/ai.ts";

/**
 * POST /api/chat
 * Send a user message and get streaming AI response
 * Uses Server-Sent Events (SSE) for real-time streaming
 */
export const handler: Handlers = {
  async POST(req) {
    // Get current user from auth token
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") || "";
    const user = await getCurrentUser(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Validate input
    if (!body?.sessionId || !body?.content) {
      return new Response(
        JSON.stringify({ error: "sessionId and content are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Verify session exists and belongs to user
    const session = await getSessionById(body.sessionId);

    if (!session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    if (session.userId !== user.id) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }

    // Save user message
    const userMessage = await addMessage(
      body.sessionId,
      "user",
      body.content.trim(),
    );

    // Get conversation history
    const history = await getSessionMessages(body.sessionId);
    const conversationHistory = buildConversationHistory(
      history,
      DARVIS_SYSTEM_PROMPT,
    );

    // Create SSE stream for AI response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullResponse = "";

        try {
          // Send user message first
          controller.enqueue(
            encoder.encode(
              `data: ${
                JSON.stringify({
                  type: "user_message",
                  message: userMessage,
                })
              }\n\n`,
            ),
          );

          // Stream AI response
          for await (
            const chunk of getAiCompletionStream(conversationHistory)
          ) {
            if (chunk.done) {
              // Save complete AI response to database
              const aiMessage = await addMessage(
                body.sessionId,
                "assistant",
                fullResponse,
              );

              // Send completion event
              controller.enqueue(
                encoder.encode(
                  `data: ${
                    JSON.stringify({
                      type: "ai_complete",
                      message: aiMessage,
                    })
                  }\n\n`,
                ),
              );
              break;
            } else {
              fullResponse += chunk.content;

              // Send content chunk
              controller.enqueue(
                encoder.encode(
                  `data: ${
                    JSON.stringify({
                      type: "ai_chunk",
                      content: chunk.content,
                    })
                  }\n\n`,
                ),
              );
            }
          }
        } catch (error) {
          console.error("AI streaming error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${
                JSON.stringify({
                  type: "error",
                  error: error instanceof Error ? error.message : "Unknown error",
                })
              }\n\n`,
            ),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  },
};
