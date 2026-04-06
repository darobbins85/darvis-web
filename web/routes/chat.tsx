import { Handlers, PageProps } from "$fresh/server.ts";
import ChatInterface from "../islands/ChatInterface.tsx";
import { getTokenFromCookie } from "../lib/auth.ts";

interface ChatPageData {
  authToken: string;
}

export const handler: Handlers<ChatPageData> = {
  async GET(req, ctx) {
    // Get token from query param (for initial redirect) or cookie
    const url = new URL(req.url);
    let authToken = url.searchParams.get("token") || "";
    
    if (!authToken) {
      // Try to get from cookie
      const cookie = req.headers.get("cookie");
      authToken = getTokenFromCookie(cookie) || "";
    }

    if (!authToken) {
      // Redirect to login if no token
      return new Response(null, {
        status: 303,
        headers: { location: "/login" },
      });
    }

    return ctx.render({ authToken });
  },
};

export default function ChatPage({ data }: PageProps<ChatPageData>) {
  return <ChatInterface authToken={data.authToken} />;
}
