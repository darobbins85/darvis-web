/**
 * OpenAI API Client
 * Handles AI chat completions with streaming support
 */

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

/**
 * Get AI completion for a conversation
 * Non-streaming version for simple API calls
 */
export async function getAiCompletion(
  messages: ChatMessage[],
  model: string = "gpt-4o-mini",
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

/**
 * Get streaming AI completion
 * Returns an async generator that yields content chunks
 */
export async function* getAiCompletionStream(
  messages: ChatMessage[],
  model: string = "gpt-4o-mini",
): AsyncGenerator<StreamChunk> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  if (!response.body) {
    throw new Error("Response body is null");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        yield { content: "", done: true };
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (!trimmed.startsWith("data: ")) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const content = json.choices[0]?.delta?.content;

          if (content) {
            yield { content, done: false };
          }
        } catch (e) {
          console.error("Failed to parse SSE line:", trimmed, e);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Build conversation history for OpenAI
 * Converts database messages to OpenAI format
 */
export function buildConversationHistory(
  dbMessages: Array<{ role: string; content: string }>,
  systemPrompt?: string,
): ChatMessage[] {
  const messages: ChatMessage[] = [];

  // Add system prompt if provided
  if (systemPrompt) {
    messages.push({
      role: "system",
      content: systemPrompt,
    });
  }

  // Add conversation history
  for (const msg of dbMessages) {
    if (msg.role === "user" || msg.role === "assistant") {
      messages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    }
  }

  return messages;
}

/**
 * Default system prompt for Darvis
 */
export const DARVIS_SYSTEM_PROMPT = `You are Darvis, a helpful AI assistant. You are friendly, concise, and helpful.

Key traits:
- Be conversational and natural
- Keep responses focused and concise
- Use markdown formatting when helpful
- If asked to do something you can't do, explain clearly
- Be honest about your limitations`;
