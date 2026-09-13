import { createServerFn } from "@tanstack/react-start";
import { sql } from "~/db";

/* ------------------------------------------------------------------ */
/* Panel layout — the second step of the pipeline. A creator picks a    */
/* page preset (how many cells, arranged how) and assigns each cell a   */
/* script panel number. One layout per (device, script), upserted.      */
/*                                                                      */
/* Layout JSON shape (stored in panel_layouts.layout):                  */
/*   { pages: [{ pageNum, preset, panelOrder }] }                       */
/* panelOrder maps preset cells (in array order) to script panel        */
/* numbers. 0 = blank cell (no script panel assigned). Positive ints    */
/* are 1-based script panel numbers. Length always equals the preset's  */
/* cell count.                                                          */
/* ------------------------------------------------------------------ */

export type PresetId =
  | "splash"
  | "grid-2x2"
  | "grid-2x3"
  | "grid-3x2"
  | "stacked-3"
  | "asym-5";

export interface PresetCell {
  /** Display label for the cell (A, B, C…). */
  name: string;
  /** 1-based grid column/row this cell starts in. */
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

export interface PresetDef {
  id: PresetId;
  label: string;
  description: string;
  cols: number;
  rows: number;
  /** Cells in render order — panelOrder[i] maps to cells[i]. */
  cells: PresetCell[];
}

const cell = (name: string, col: number, row: number, colSpan = 1, rowSpan = 1): PresetCell => ({
  name,
  col,
  row,
  colSpan,
  rowSpan,
});

/** Full-page rectangle grid (cells row-major). */
function rectGrid(cols: number, rows: number): PresetCell[] {
  const cells: PresetCell[] = [];
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      cells.push(cell(String.fromCharCode(64 + cells.length + 1), c, r));
    }
  }
  return cells;
}

/** The ~6 core page presets. Whitelist for the save validator lives here. */
export const PRESETS: PresetDef[] = [
  {
    id: "splash",
    label: "Splash",
    description: "1 full-page panel",
    cols: 1,
    rows: 1,
    cells: rectGrid(1, 1),
  },
  {
    id: "grid-2x2",
    label: "Grid 2×2",
    description: "4 equal panels",
    cols: 2,
    rows: 2,
    cells: rectGrid(2, 2),
  },
  {
    id: "grid-2x3",
    label: "Grid 2×3",
    description: "6 panels, 2 rows of 3",
    cols: 3,
    rows: 2,
    cells: rectGrid(3, 2),
  },
  {
    id: "grid-3x2",
    label: "Grid 3×2",
    description: "6 panels, 3 rows of 2",
    cols: 2,
    rows: 3,
    cells: rectGrid(2, 3),
  },
  {
    id: "stacked-3",
    label: "Stacked 3",
    description: "3 full-width rows",
    cols: 1,
    rows: 3,
    cells: rectGrid(1, 3),
  },
  {
    id: "asym-5",
    label: "Asym 2+3",
    description: "2 wide top panels, 3 across the bottom",
    cols: 6,
    rows: 2,
    cells: [
      cell("A", 1, 1, 3),
      cell("B", 4, 1, 3),
      cell("C", 1, 2, 2),
      cell("D", 3, 2, 2),
      cell("E", 5, 2, 2),
    ],
  },
];

const PRESET_BY_ID = new Map<PresetId, PresetDef>(PRESETS.map((p) => [p.id, p]));

export function presetById(id: string): PresetDef | null {
  return PRESET_BY_ID.get(id as PresetId) ?? null;
}

/** One page's layout state: preset + per-cell script panel assignment. */
export interface PanelLayoutPage {
  pageNum: number;
  preset: PresetId;
  /** Length === preset cell count; entry = script panel num, or 0 = blank. */
  panelOrder: number[];
}

/** The stored layout shape. */
export interface PanelLayoutPayload {
  pages: PanelLayoutPage[];
}

export type LayoutResult =
  | { ok: true; created?: boolean }
  | { ok: false; message: string };

export type GetLayoutResult =
  | { ok: true; layout: PanelLayoutPayload | null }
  | { ok: false; message: string };

/* ------------------------------------------------------------------ */
/* Pure helpers shared with the route (defaults + graceful revalidation) */
/* ------------------------------------------------------------------ */

/** Default assignment: cells get script panels in ascending num order;
 *  cells beyond the script's panel count stay blank. */
export function defaultPanelOrder(preset: PresetDef, panelNums: number[]): number[] {
  const sorted = [...panelNums].sort((a, b) => a - b);
  return preset.cells.map((_, i) => sorted[i] ?? 0);
}

/** Clamp a stored panelOrder to a preset + the script's current panels:
 *  entries whose panel num no longer exists (or is out of range) are
 *  dropped, duplicates collapse, and freed cells are refilled in order
 *  with still-unplaced panels. Never crashes, never duplicates. */
export function revalidatePanelOrder(
  preset: PresetDef,
  panelNums: number[],
  stored: number[],
): number[] {
  const valid = new Set(panelNums);
  const used = new Set<number>();
  const order = preset.cells.map((_, i) => {
    const v = stored[i];
    if (typeof v === "number" && v > 0 && valid.has(v) && !used.has(v)) {
      used.add(v);
      return v;
    }
    return 0;
  });
  const fillNums = [...panelNums].filter((n) => !used.has(n)).sort((a, b) => a - b);
  let fi = 0;
  return order.map((v) => (v === 0 ? (fillNums[fi++] ?? 0) : v));
}

/* ------------------------------------------------------------------ */
/* DB                                                                  */
/* ------------------------------------------------------------------ */

/** Create the table + uniqueness constraint on first use. */
async function ensureTable(db: ReturnType<typeof sql>) {
  await db`
    CREATE TABLE IF NOT EXISTS panel_layouts (
      id serial primary key,
      device_id text not null,
      script_id int not null,
      layout jsonb not null,
      created_at timestamptz default now(),
      updated_at timestamptz default now(),
      UNIQUE (device_id, script_id)
    )
  `;
}

function layoutError(err: unknown): { ok: false; message: string } {
  if (err instanceof Error && err.message.includes("DATABASE_URL is not set")) {
    return {
      ok: false,
      message: "Panels aren't available right now — the layout studio is offline. Try again shortly.",
    };
  }
  console.error("[panel-layouts] failed:", err);
  return { ok: false, message: "Something went wrong — try again shortly." };
}

/* ------------------------------------------------------------------ */
/* Save (upsert)                                                       */
/* ------------------------------------------------------------------ */

/* POST: the layout payload (up to 64 pages × 99 entries) overflows the
   GET-query-string limit when encoded into the URL. */
export const savePanelLayout = createServerFn({ method: "POST" })
  .validator((d: unknown) => {
    const raw = (d ?? {}) as {
      deviceId?: unknown;
      scriptId?: unknown;
      layout?: unknown;
    };

    const deviceId = typeof raw.deviceId === "string" ? raw.deviceId.trim() : "";
    if (!deviceId) throw new Error("Missing device id.");
    if (deviceId.length > 128) throw new Error("Device id is too long.");

    const scriptId = typeof raw.scriptId === "number" ? raw.scriptId : Number(String(raw.scriptId ?? "").trim());
    if (!Number.isInteger(scriptId) || scriptId <= 0) throw new Error("Invalid script id.");

    const layoutRaw = (raw.layout ?? {}) as { pages?: unknown };
    const pagesRaw = layoutRaw.pages;
    if (!Array.isArray(pagesRaw) || pagesRaw.length === 0 || pagesRaw.length > 64) {
      throw new Error("Layout has no valid pages.");
    }

    const pages: PanelLayoutPage[] = pagesRaw.map((row: unknown) => {
      const p = (row ?? {}) as { pageNum?: unknown; preset?: unknown; panelOrder?: unknown };

      const pageNum = typeof p.pageNum === "number" ? p.pageNum : Number(String(p.pageNum ?? "").trim());
      if (!Number.isInteger(pageNum) || pageNum < 1 || pageNum > 64) {
        throw new Error("Layout page number is out of range.");
      }

      const presetStr = typeof p.preset === "string" ? p.preset : "";
      const def = presetById(presetStr);
      if (!def) throw new Error("Unknown page preset.");
      const preset: PresetId = def.id;

      const orderRaw = p.panelOrder;
      if (!Array.isArray(orderRaw) || orderRaw.length === 0 || orderRaw.length > 99) {
        throw new Error("Panel order is not a valid list.");
      }
      if (orderRaw.length !== def.cells.length) {
        throw new Error("Panel order must match the preset's cell count.");
      }
      const panelOrder: number[] = orderRaw.map((v: unknown) => {
        const n = typeof v === "number" ? v : Number(String(v ?? "").trim());
        if (!Number.isInteger(n) || n < 0 || n > 99) {
          throw new Error("Panel order contains an invalid panel number.");
        }
        return n;
      });
      // A script panel can occupy at most one cell (0 = blank).
      const assigned = panelOrder.filter((n) => n > 0);
      if (new Set(assigned).size !== assigned.length) {
        throw new Error("A script panel is assigned to more than one cell.");
      }

      return { pageNum, preset, panelOrder };
    });

    // Each script page may appear at most once.
    const seen = new Set<number>();
    for (const pg of pages) {
      if (seen.has(pg.pageNum)) throw new Error("Layout repeats a page number.");
      seen.add(pg.pageNum);
    }

    return { deviceId, scriptId, layout: { pages } };
  })
  .handler(async ({ data }): Promise<LayoutResult> => {
    try {
      const db = sql();
      await ensureTable(db);
      await db`
        INSERT INTO panel_layouts (device_id, script_id, layout)
        VALUES (${data.deviceId}, ${data.scriptId}, ${JSON.stringify(data.layout)})
        ON CONFLICT (device_id, script_id)
        DO UPDATE SET layout = EXCLUDED.layout, updated_at = now()
      `;
      return { ok: true, created: true };
    } catch (err) {
      return layoutError(err);
    }
  });

/* ------------------------------------------------------------------ */
/* Get (small payload — default GET is fine)                           */
/* ------------------------------------------------------------------ */

export const getPanelLayout = createServerFn()
  .validator((d: unknown) => {
    const raw = (d ?? {}) as { deviceId?: unknown; scriptId?: unknown };
    const deviceId = typeof raw.deviceId === "string" ? raw.deviceId.trim() : "";
    if (!deviceId) throw new Error("Missing device id.");
    if (deviceId.length > 128) throw new Error("Device id is too long.");
    const scriptId = typeof raw.scriptId === "number" ? raw.scriptId : Number(String(raw.scriptId ?? "").trim());
    if (!Number.isInteger(scriptId) || scriptId <= 0) throw new Error("Invalid script id.");
    return { deviceId, scriptId };
  })
  .handler(async ({ data }): Promise<GetLayoutResult> => {
    try {
      const db = sql();
      await ensureTable(db);
      const rows = await db`
        SELECT layout FROM panel_layouts
        WHERE device_id = ${data.deviceId} AND script_id = ${data.scriptId}
        LIMIT 1
      `;
      if (rows.length === 0) return { ok: true, layout: null };
      return {
        ok: true,
        layout: (rows[0].layout ?? null) as PanelLayoutPayload | null,
      };
    } catch (err) {
      return layoutError(err);
    }
  });

/* ------------------------------------------------------------------ */
/* Delete (idempotent)                                                 */
/* ------------------------------------------------------------------ */

export const deletePanelLayout = createServerFn({ method: "POST" })
  .validator((d: unknown) => {
    const raw = (d ?? {}) as { deviceId?: unknown; scriptId?: unknown };
    const deviceId = typeof raw.deviceId === "string" ? raw.deviceId.trim() : "";
    if (!deviceId) throw new Error("Missing device id.");
    if (deviceId.length > 128) throw new Error("Device id is too long.");
    const scriptId = typeof raw.scriptId === "number" ? raw.scriptId : Number(String(raw.scriptId ?? "").trim());
    if (!Number.isInteger(scriptId) || scriptId <= 0) throw new Error("Invalid script id.");
    return { deviceId, scriptId };
  })
  .handler(async ({ data }): Promise<LayoutResult> => {
    try {
      const db = sql();
      await ensureTable(db);
      await db`
        DELETE FROM panel_layouts
        WHERE device_id = ${data.deviceId} AND script_id = ${data.scriptId}
      `;
      return { ok: true };
    } catch (err) {
      return layoutError(err);
    }
  });