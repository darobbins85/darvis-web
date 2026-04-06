/**
 * POST /api/auth/logout
 * 
 * Logout current user and clear session
 */

import { Handlers } from "$fresh/server.ts";
import { logout, getTokenFromCookie, createLogoutCookie } from "../../../lib/auth.ts";

export const handler: Handlers = {
  async POST(req) {
    const token = getTokenFromCookie(req.headers.get("cookie"));
    
    if (token) {
      await logout(token);
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": createLogoutCookie(),
        },
      }
    );
  },
};
