/**
 * POST /api/auth/login
 * 
 * Authenticate existing user
 */

import { Handlers } from "$fresh/server.ts";
import { login } from "../../../lib/auth.ts";
import { createAuthCookie } from "../../../lib/auth.ts";

interface LoginRequest {
  username: string;
  password: string;
}

export const handler: Handlers = {
  async POST(req) {
    try {
      const body: LoginRequest = await req.json();
      
      if (!body.username || !body.password) {
        return new Response(
          JSON.stringify({ error: "Username and password are required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      const { user, token } = await login(body.username, body.password);
      
      return new Response(
        JSON.stringify({
          success: true,
          data: { user, token },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": createAuthCookie(token),
          },
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      
      return new Response(
        JSON.stringify({ error: message }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};
