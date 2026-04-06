/**
 * GET /api/auth/me
 * 
 * Get current authenticated user
 */

import { Handlers } from "$fresh/server.ts";
import { getCurrentUser, getTokenFromCookie } from "../../../lib/auth.ts";

export const handler: Handlers = {
  async GET(req) {
    const token = getTokenFromCookie(req.headers.get("cookie"));
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    const user = await getCurrentUser(token);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        data: { user },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  },
};
