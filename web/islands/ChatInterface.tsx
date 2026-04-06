import { Signal, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import type { Message, Session } from "../types/index.ts";

interface ChatInterfaceProps {
  initialSession?: Session;
  authToken: string;
}

export default function ChatInterface(props: ChatInterfaceProps) {
  const sessions = useSignal<Session[]>([]);
  const currentSession = useSignal<Session | null>(props.initialSession || null);
  const messages = useSignal<Message[]>([]);
  const inputText = useSignal("");
  const loading = useSignal(false);
  const error = useSignal<string | null>(null);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Load messages when session changes
  useEffect(() => {
    if (currentSession.value) {
      loadMessages(currentSession.value.id);
    }
  }, [currentSession.value?.id]);

  async function loadSessions() {
    try {
      const response = await fetch("/api/sessions", {
        headers: {
          "Authorization": `Bearer ${props.authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        sessions.value = data.sessions || [];

        // If no current session, create one
        if (!currentSession.value && sessions.value.length === 0) {
          await createNewSession();
        } else if (!currentSession.value && sessions.value.length > 0) {
          currentSession.value = sessions.value[0];
        }
      }
    } catch (err) {
      error.value = "Failed to load sessions";
      console.error(err);
    }
  }

  async function loadMessages(sessionId: string) {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/messages`, {
        headers: {
          "Authorization": `Bearer ${props.authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        messages.value = data.messages || [];
      }
    } catch (err) {
      error.value = "Failed to load messages";
      console.error(err);
    }
  }

  async function createNewSession() {
    try {
      loading.value = true;
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${props.authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newSession = data.session;
        sessions.value = [newSession, ...sessions.value];
        currentSession.value = newSession;
        messages.value = [];
      }
    } catch (err) {
      error.value = "Failed to create session";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function sendMessage(e: Event) {
    e.preventDefault();

    const content = inputText.value.trim();
    if (!content || !currentSession.value) return;

    try {
      loading.value = true;
      error.value = null;
      inputText.value = ""; // Clear input immediately

      // Send message and get streaming AI response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${props.authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: currentSession.value.id,
          content,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        error.value = data.error || "Failed to send message";
        return;
      }

      // Process Server-Sent Events stream
      const reader = response.body?.getReader();
      if (!reader) {
        error.value = "Failed to read response stream";
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let aiMessageContent = "";
      let aiMessageId = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          try {
            const data = JSON.parse(trimmed.slice(6));

            if (data.type === "user_message") {
              // Add user message to UI
              messages.value = [...messages.value, data.message];
            } else if (data.type === "ai_chunk") {
              // Accumulate AI response chunks
              aiMessageContent += data.content;

              // Update or add streaming message
              if (!aiMessageId) {
                // Create temporary streaming message
                const streamingMessage = {
                  id: "streaming",
                  sessionId: currentSession.value!.id,
                  role: "assistant" as const,
                  content: aiMessageContent,
                  createdAt: new Date(),
                };
                messages.value = [...messages.value, streamingMessage];
                aiMessageId = "streaming";
              } else {
                // Update streaming message
                messages.value = messages.value.map((msg) =>
                  msg.id === "streaming"
                    ? { ...msg, content: aiMessageContent }
                    : msg
                );
              }
            } else if (data.type === "ai_complete") {
              // Replace streaming message with final message
              messages.value = messages.value.map((msg) =>
                msg.id === "streaming" ? data.message : msg
              );
              aiMessageContent = "";
              aiMessageId = "";
            } else if (data.type === "error") {
              error.value = data.error;
            }
          } catch (err) {
            console.error("Failed to parse SSE:", trimmed, err);
          }
        }
      }
    } catch (err) {
      error.value = "Failed to send message";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  function formatTime(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${props.authToken}`,
        },
      });
    } finally {
      globalThis.location.href = "/";
    }
  }

  return (
    <div class="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header class="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <h1 class="text-2xl font-bold flex items-center gap-2">
            <span class="text-[#00d4aa]">Darvis</span>
            <span class="text-gray-400">Voice Assistant</span>
          </h1>
          <div class="flex items-center gap-4">
            <button
              onClick={() => createNewSession()}
              disabled={loading.value}
              class="px-4 py-2 bg-[#00d4aa] hover:bg-[#00b890] rounded-lg font-medium text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              New Chat
            </button>
            <button
              onClick={handleLogout}
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {error.value && (
        <div class="bg-red-900/50 border-l-4 border-red-500 px-4 py-3 max-w-7xl mx-auto mt-4">
          <p class="text-red-200">{error.value}</p>
        </div>
      )}

      <div class="max-w-7xl mx-auto flex h-[calc(100vh-64px)]">
        {/* Sidebar - Session List */}
        <aside class="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div class="p-4">
            <h2 class="text-sm font-semibold text-gray-400 uppercase mb-3">
              Chat History
            </h2>
            <div class="space-y-2">
              {sessions.value.length === 0
                ? (
                  <p class="text-sm text-gray-500 text-center py-4">
                    No sessions yet
                  </p>
                )
                : sessions.value.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => currentSession.value = session}
                    class={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentSession.value?.id === session.id
                        ? "bg-[#00d4aa]/20 border border-[#00d4aa]"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    <p class="text-sm font-medium truncate">{session.name}</p>
                    <p class="text-xs text-gray-400 mt-1">
                      {formatTime(session.updatedAt)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main class="flex-1 flex flex-col">
          {/* Messages */}
          <div class="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.value.length === 0
              ? (
                /* Welcome message */
                <div class="max-w-3xl mx-auto text-center py-12">
                  <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#00a080] flex items-center justify-center">
                    <svg
                      class="w-12 h-12 text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <h2 class="text-2xl font-bold mb-2">Welcome to Darvis</h2>
                  <p class="text-gray-400">
                    Your AI-powered voice assistant. Start a conversation below.
                  </p>
                </div>
              )
              : messages.value.map((message) => (
                <div
                  key={message.id}
                  class="flex gap-3 max-w-3xl mx-auto"
                >
                  <div
                    class={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-semibold ${
                      message.role === "user"
                        ? "bg-blue-600"
                        : "bg-[#00d4aa] text-gray-900"
                    }`}
                  >
                    {message.role === "user" ? "U" : "D"}
                  </div>
                  <div
                    class={`flex-1 rounded-lg p-4 ${
                      message.role === "user" ? "bg-gray-800" : "bg-gray-700"
                    }`}
                  >
                    <p class="text-gray-100 whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p class="text-xs text-gray-500 mt-2">
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          {/* Input Area */}
          <div class="border-t border-gray-700 p-4 bg-gray-800">
            <div class="max-w-3xl mx-auto">
              <form onSubmit={sendMessage} class="flex gap-3">
                <input
                  type="text"
                  value={inputText.value}
                  onInput={(e) => inputText.value = e.currentTarget.value}
                  placeholder="Type your message..."
                  disabled={loading.value || !currentSession.value}
                  class="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00d4aa] placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  autofocus
                />
                <button
                  type="submit"
                  disabled={loading.value ||
                    !inputText.value.trim() ||
                    !currentSession.value}
                  class="px-6 py-3 bg-[#00d4aa] hover:bg-[#00b890] text-gray-900 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{loading.value ? "Sending..." : "Send"}</span>
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </form>
              <p class="text-xs text-gray-500 text-center mt-3">
                Press Enter to send • AI responses coming in next phase
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
