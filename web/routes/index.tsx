import { Handlers } from "$fresh/server.ts";
import { getTokenFromCookie } from "../lib/auth.ts";

export const handler: Handlers = {
  GET(req) {
    // Check if user is logged in
    const cookie = req.headers.get("cookie");
    const authToken = getTokenFromCookie(cookie);

    if (authToken) {
      // Redirect to chat if logged in
      return new Response(null, {
        status: 303,
        headers: { location: "/chat" },
      });
    } else {
      // Redirect to login if not logged in
      return new Response(null, {
        status: 303,
        headers: { location: "/login" },
      });
    }
  },
};
