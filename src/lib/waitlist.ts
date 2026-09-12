import { createServerFn } from "@tanstack/react-start";
import { sql } from "~/db";

export type WaitlistResult = { ok: true; message: string } | { ok: false; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const joinWaitlist = createServerFn()
  .validator((d: unknown) => {
    const input = (d ?? {}) as { name?: unknown; email?: unknown };
    const name = typeof input.name === "string" ? input.name.trim() : "";
    const email = typeof input.email === "string" ? input.email.trim() : "";
    if (!name) throw new Error("Please enter your name.");
    if (name.length > 200) throw new Error("Name is too long.");
    if (!email) throw new Error("Please enter your email.");
    if (!EMAIL_RE.test(email)) throw new Error("Please enter a valid email address.");
    if (email.length > 320) throw new Error("Email is too long.");
    return { name, email: email.toLowerCase() };
  })
  .handler(async ({ data }): Promise<WaitlistResult> => {
    try {
      const db = sql(); // throws if DATABASE_URL is not set
      await db`
        CREATE TABLE IF NOT EXISTS waitlist (
          id serial primary key,
          name text not null,
          email text not null unique,
          created_at timestamptz default now()
        )
      `;
      await db`INSERT INTO waitlist (name, email) VALUES (${data.name}, ${data.email})`;
      return { ok: true, message: "You're on the list!" };
    } catch (err) {
      // No database connected yet — degrade gracefully instead of crashing.
      if (err instanceof Error && err.message.includes("DATABASE_URL is not set")) {
        return { ok: false, message: "We're setting up signups — try again shortly." };
      }
      // Duplicate email (Postgres unique violation 23505).
      const code = (err as { code?: unknown })?.code;
      const msg = err instanceof Error ? err.message : "";
      if (code === "23505" || msg.includes("duplicate key")) {
        return { ok: false, message: "You're already on the list!" };
      }
      // Unknown failure — never leak a raw exception to the client.
      console.error("[waitlist] insert failed:", err);
      return { ok: false, message: "Something went wrong — try again shortly." };
    }
  });