import { Handlers, PageProps } from "$fresh/server.ts";

interface SignupData {
  error?: string;
}

export const handler: Handlers<SignupData> = {
  async POST(req, ctx) {
    const form = await req.formData();
    const username = form.get("username")?.toString() || "";
    const password = form.get("password")?.toString() || "";

    // Validate
    if (username.length < 3) {
      return ctx.render({ error: "Username must be at least 3 characters" });
    }
    if (password.length < 6) {
      return ctx.render({ error: "Password must be at least 6 characters" });
    }

    // Call signup API
    const response = await fetch(`${new URL(req.url).origin}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      
      // Set cookie and redirect to chat
      const headers = new Headers();
      const cookie = response.headers.get("set-cookie");
      if (cookie) {
        headers.set("set-cookie", cookie);
      }
      
      // Also set token in URL for initial load
      headers.set("location", `/chat?token=${data.token}`);
      
      return new Response(null, {
        status: 303,
        headers,
      });
    } else {
      const data = await response.json();
      return ctx.render({ error: data.error || "Failed to create account" });
    }
  },
};

export default function SignupPage({ data }: PageProps<SignupData>) {
  return (
    <div class="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div class="max-w-md w-full">
        {/* Logo/Header */}
        <div class="text-center mb-8">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#00a080] flex items-center justify-center">
            <svg
              class="w-10 h-10 text-gray-900"
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
          <h1 class="text-3xl font-bold text-white mb-2">
            Join <span class="text-[#00d4aa]">Darvis</span>
          </h1>
          <p class="text-gray-400">Create your account to get started</p>
        </div>

        {/* Signup Form */}
        <div class="bg-gray-800 rounded-lg shadow-xl p-8">
          <h2 class="text-xl font-semibold text-white mb-6">Sign Up</h2>

          {data?.error && (
            <div class="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
              <p class="text-sm text-red-200">{data.error}</p>
            </div>
          )}

          <form method="POST" class="space-y-4">
            <div>
              <label
                for="username"
                class="block text-sm font-medium text-gray-300 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                minLength={3}
                class="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d4aa] placeholder-gray-400"
                placeholder="Choose a username (min 3 characters)"
                autofocus
              />
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                minLength={6}
                class="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d4aa] placeholder-gray-400"
                placeholder="Choose a password (min 6 characters)"
              />
            </div>

            <button
              type="submit"
              class="w-full px-4 py-3 bg-[#00d4aa] hover:bg-[#00b890] text-gray-900 font-semibold rounded-lg transition-colors"
            >
              Create Account
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-400">
              Already have an account?{" "}
              <a href="/login" class="text-[#00d4aa] hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>

        <p class="text-center text-sm text-gray-500 mt-6">
          Phase 2: Chat Interface • AI Integration Coming Soon
        </p>
      </div>
    </div>
  );
}
