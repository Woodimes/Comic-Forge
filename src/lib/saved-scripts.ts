import { createServerFn } from "@tanstack/react-start";
import { sql } from "~/db";
import type { ForgeInput, ForgedScript } from "./scriptgen";

export type SaveResult =
  | { ok: true; id: number; created: boolean }
  | { ok: false; message: string };

export type ListResult =
  | { ok: true; scripts: SavedScriptSummary[] }
  | { ok: false; message: string };

export type DeleteResult = { ok: true } | { ok: false; message: string };

/** One saved script as the list returns it (timestamps as ISO strings). */
export interface SavedScriptSummary {
  id: number;
  title: string;
  /** The exact form fields the engine used to generate `script`. */
  inputs: ForgeInput;
  /** The exact generated artifact — loading renders this, never a regeneration. */
  script: ForgedScript;
  created_at: string;
  updated_at: string;
}

/** Create the table + device index on first use. */
async function ensureTable(db: ReturnType<typeof sql>) {
  await db`
    CREATE TABLE IF NOT EXISTS saved_scripts (
      id serial primary key,
      device_id text not null,
      title text not null,
      inputs jsonb not null,
      script jsonb not null,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    )
  `;
  // List queries always filter by device and sort by most-recently-updated.
  await db`
    CREATE INDEX IF NOT EXISTS saved_scripts_device_updated_idx
    ON saved_scripts (device_id, updated_at DESC)
  `;
}

/** Coerce a timestamptz (Date from the driver, or a string) to an ISO string. */
function toIso(v: unknown): string {
  if (v instanceof Date) return v.toISOString();
  const s = String(v);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toISOString();
}

function deviceIdError(err: unknown): { ok: false; message: string } {
  if (err instanceof Error && err.message.includes("DATABASE_URL is not set")) {
    return { ok: false, message: "Saving isn't available right now — the vault is offline. Try again shortly." };
  }
  console.error("[saved-scripts] failed:", err);
  return { ok: false, message: "Something went wrong — try again shortly." };
}

/* ------------------------------------------------------------------ */
/* Save (insert on first save; update the same row on re-save, which   */
/* bumps updated_at so it bubbles to the top of the list).             */
/* ------------------------------------------------------------------ */

/* POST (not the default GET): the payload is the full generated script, which
   overflows the URL-length limit when encoded into a query string. */
export const saveScript = createServerFn({ method: "POST" })
  .validator((d: unknown) => {
    const raw = (d ?? {}) as { id?: unknown; deviceId?: unknown; inputs?: unknown; script?: unknown };

    const deviceId = typeof raw.deviceId === "string" ? raw.deviceId.trim() : "";
    if (!deviceId) throw new Error("Missing device id.");
    if (deviceId.length > 128) throw new Error("Device id is too long.");

    const inputs = (raw.inputs ?? {}) as Record<string, unknown>;
    const title = typeof inputs.title === "string" ? inputs.title.trim() : "";
    if (!title) throw new Error("Missing script title.");
    if (title.length > 200) throw new Error("Title is too long.");

    const script = (raw.script ?? {}) as Record<string, unknown>;
    const pages = script.pages;
    if (!Array.isArray(pages) || pages.length === 0 || pages.length > 64) {
      throw new Error("Script is not a valid forged script.");
    }

    let id: number | null = null;
    if (raw.id !== undefined && raw.id !== null) {
      id = typeof raw.id === "number" ? raw.id : Number(String(raw.id).trim());
      if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid script id.");
    }

    return { deviceId, inputs, script, id };
  })
  .handler(async ({ data }): Promise<SaveResult> => {
    try {
      const db = sql();
      await ensureTable(db);

      if (data.id !== null) {
        // Re-save: update the creator's own row in place.
        const updated = await db`
          UPDATE saved_scripts
          SET title = ${String(data.inputs.title).trim()},
              inputs = ${JSON.stringify(data.inputs)},
              script = ${JSON.stringify(data.script)},
              updated_at = now()
          WHERE id = ${data.id} AND device_id = ${data.deviceId}
          RETURNING id
        `;
        if (updated.length > 0) {
          return { ok: true, id: Number(updated[0].id), created: false };
        }
        // Row disappeared (deleted elsewhere) — fall through to a fresh insert.
      }

      const inserted = await db`
        INSERT INTO saved_scripts (device_id, title, inputs, script)
        VALUES (
          ${data.deviceId},
          ${String(data.inputs.title).trim()},
          ${JSON.stringify(data.inputs)},
          ${JSON.stringify(data.script)}
        )
        RETURNING id
      `;
      return { ok: true, id: Number(inserted[0].id), created: true };
    } catch (err) {
      return deviceIdError(err);
    }
  });

/* ------------------------------------------------------------------ */

export const listScripts = createServerFn()
  .validator((d: unknown) => {
    const raw = (d ?? {}) as { deviceId?: unknown };
    const deviceId = typeof raw.deviceId === "string" ? raw.deviceId.trim() : "";
    if (!deviceId) throw new Error("Missing device id.");
    if (deviceId.length > 128) throw new Error("Device id is too long.");
    return { deviceId };
  })
  .handler(async ({ data }): Promise<ListResult> => {
    try {
      const db = sql();
      await ensureTable(db);
      const rows = await db`
        SELECT id, title, inputs, script, created_at, updated_at
        FROM saved_scripts
        WHERE device_id = ${data.deviceId}
        ORDER BY updated_at DESC, id DESC
        LIMIT 200
      `;
      return {
        ok: true,
        scripts: rows.map((r) => ({
          id: Number(r.id),
          title: String(r.title),
          inputs: r.inputs as ForgeInput,
          script: r.script as ForgedScript,
          created_at: toIso(r.created_at),
          updated_at: toIso(r.updated_at),
        })),
      };
    } catch (err) {
      return deviceIdError(err);
    }
  });

/* ------------------------------------------------------------------ */

export const deleteScript = createServerFn({ method: "POST" })
  .validator((d: unknown) => {
    const raw = (d ?? {}) as { deviceId?: unknown; id?: unknown };
    const deviceId = typeof raw.deviceId === "string" ? raw.deviceId.trim() : "";
    if (!deviceId) throw new Error("Missing device id.");
    const id = typeof raw.id === "number" ? raw.id : Number(String(raw.id).trim());
    if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid script id.");
    return { deviceId, id };
  })
  .handler(async ({ data }): Promise<DeleteResult> => {
    try {
      const db = sql();
      await ensureTable(db);
      await db`
        DELETE FROM saved_scripts
        WHERE id = ${data.id} AND device_id = ${data.deviceId}
      `;
      // Idempotent: the row is gone either way.
      return { ok: true };
    } catch (err) {
      return deviceIdError(err);
    }
  });