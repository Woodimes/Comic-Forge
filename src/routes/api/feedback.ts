import { createFileRoute } from "@tanstack/react-router";
import { sql } from "~/db";

/**
 * POST /api/feedback — creator feedback from the live tools (Script Forge,
 * Panel Layout). Fire-and-forget from the page: the client only cares whether
 * the row landed, so the response is a small JSON envelope.
 *
 * Body: { deviceId: string, page: string, message: string, email?: string }
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_MESSAGE = 4000;
const MAX_PAGE = 64;
const MAX_EMAIL = 320;

/** Same shape/naming as saved_scripts + panel_layouts: device-scoped, no accounts. */
async function ensureTable(db: ReturnType<typeof sql>) {
  await db`
    CREATE TABLE IF NOT EXISTS feedback (
      id serial primary key,
      device_id text not null,
      page text not null,
      message text not null,
      email text,
      created_at timestamptz default now()
    )
  `;
}

function fail(message: string, status = 400) {
  return Response.json({ ok: false, message }, { status });
}

/** Timestamps come back as JS Dates — coerce to an ISO string before serializing. */
function toIso(v: unknown): string {
  if (v instanceof Date) return v.toISOString();
  const s = String(v);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toISOString();
}

export const Route = createFileRoute("/api/feedback")({
  server: {
    handlers: {
      // Nothing reads feedback back yet; POST is the only supported verb.
      GET: async () =>
        Response.json({ ok: false, message: "Use POST." }, { status: 405, headers: { allow: "POST" } }),
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return fail("Send a JSON body.");
        }

        const raw = (body ?? {}) as {
          deviceId?: unknown;
          page?: unknown;
          message?: unknown;
          email?: unknown;
        };

        const deviceId = typeof raw.deviceId === "string" ? raw.deviceId.trim() : "";
        const page = typeof raw.page === "string" ? raw.page.trim() : "";
        const message = typeof raw.message === "string" ? raw.message.trim() : "";
        const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";

        if (!deviceId) return fail("Missing device id.");
        if (deviceId.length > 128) return fail("Device id is too long.");
        if (!page) return fail("Missing page.");
        if (page.length > MAX_PAGE) return fail("Page name is too long.");
        if (!message) return fail("Please write a message before sending.");
        if (message.length > MAX_MESSAGE)
          return fail(`Keep it under ${MAX_MESSAGE} characters, please.`);
        if (email && !EMAIL_RE.test(email)) return fail("That email doesn't look right.");
        if (email.length > MAX_EMAIL) return fail("Email is too long.");

        try {
          const db = sql();
          await ensureTable(db);
          const inserted = await db`
            INSERT INTO feedback (device_id, page, message, email)
            VALUES (${deviceId}, ${page}, ${message}, ${email || null})
            RETURNING id, created_at
          `;
          return Response.json({
            ok: true,
            id: Number(inserted[0].id),
            created_at: toIso(inserted[0].created_at),
          });
        } catch (err) {
          if (err instanceof Error && err.message.includes("DATABASE_URL is not set")) {
            return fail("Feedback isn't available right now — try again shortly.", 503);
          }
          console.error("[feedback] insert failed:", err);
          return fail("Something went wrong sending your feedback — try again shortly.", 500);
        }
      },
    },
  },
});
