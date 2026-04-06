import { load } from "@std/dotenv";
await load({ export: true });

import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

const port = parseInt(Deno.env.get("DARVIS_WEB_PORT") ?? "5001");
console.log(`Darvis starting on port ${port}`);

Deno.serve({ port }, app.fetch);
