/**
 * POST /api/auth/signup
 * 
 * Create a new user account
 */

import { Handlers } from "$fresh/server.ts";
import { signup } from "../../../lib/auth.ts";
import { createAuthCookie } from "../../../lib/auth.ts";

interface SignupRequest {
  username: string;
  password: string;
}

export const handler: Handlers = {
  async POST(req) {
    try {
      const body: SignupRequest = await req.json();
      
      if (!body.username || !body.password) {
        return new Response(
          JSON.stringify({ error: "Username and password are required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      const { user, token } = await signup(body.username, body.password);
      
      return new Response(
        JSON.stringify({
          success: true,
          data: { user, token },
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": createAuthCookie(token),
          },
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed";
      
      return new Response(
        JSON.stringify({ error: message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};
