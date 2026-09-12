import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import site from "../../site.json";
import type { ForgedScript, ScriptPage } from "~/lib/scriptgen";
import { listScripts } from "~/lib/saved-scripts";
import type { SavedScriptSummary } from "~/lib/saved-scripts";
import {
  PRESETS,
  defaultPanelOrder,
  deletePanelLayout,
  getPanelLayout,
  presetById,
  revalidatePanelOrder,
  savePanelLayout,
} from "~/lib/panel-layouts";
import type { PanelLayoutPage, PanelLayoutPayload, PresetId } from "~/lib/panel-layouts";

interface PanelLayoutSearch {
  saved?: string;
}

export const Route = createFileRoute("/panel-layout")({
  validateSearch: (search: Record<string, unknown>): PanelLayoutSearch => {
    const raw = search.saved;
    // TanStack serializes search values as JSON: the vault's Link produces
    // ?saved="5" (string), while a hand-typed ?saved=5 arrives as a number.
    const s = typeof raw === "string" ? raw : typeof raw === "number" ? String(raw) : "";
    return { saved: /^[1-9]\d*$/.test(s) ? s : undefined };
  },
  head: () => ({
    meta: [
      { title: "ComicForge — Panel Layout" },
      {
        name: "description",
        content:
          "Lay out a saved comic script page by page — pick a panel preset, assign each cell a script panel, and save the layout to this browser.",
      },
    ],
  }),
  component: PanelLayoutPage,
});

const BUSINESS = site.businessName || "ComicForge";
const DEFAULT_PRESET: PresetId = "grid-2x2";

/* ------------------------------------------------------------------ */
/* Device identity (accounts-lite: no login, scoped to this browser).  */
/* ------------------------------------------------------------------ */
const DEVICE_ID_KEY = "cf_device_id";
let fallbackDeviceId: string | null = null;
function getDeviceId(): string {
  try {
    const stored = window.localStorage.getItem(DEVICE_ID_KEY);
    if (stored) return stored;
    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `cf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    window.localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  } catch {
    fallbackDeviceId ??= `cf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    return fallbackDeviceId;
  }
}

/** Compact relative date for the script picker. */
function relativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "recently";
  const mins = Math.max(0, Math.floor((Date.now() - then) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const d = new Date(then);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/* ------------------------------------------------------------------ */
/* Layout state helpers                                                */
/* ------------------------------------------------------------------ */

/** Per-page editor state from a script + an optional saved layout.
 *  Saved pages are revalidated against the script's CURRENT panels, so a
 *  script that changed (panels deleted) clamps gracefully instead of crashing. */
function buildPageStates(script: ForgedScript, saved: PanelLayoutPayload | null): PanelLayoutPage[] {
  return script.pages.map((page) => {
    const panelNums = page.panels.map((p) => p.num);
    const storedPage = saved?.pages.find((pg) => pg.pageNum === page.num);
    const preset =
      (storedPage && presetById(storedPage.preset)) || presetById(DEFAULT_PRESET)!;
    const panelOrder = storedPage
      ? revalidatePanelOrder(preset, panelNums, storedPage.panelOrder)
      : defaultPanelOrder(preset, panelNums);
    return { pageNum: page.num, preset: preset.id, panelOrder };
  });
}

/** Panel numbers of a script page that aren't placed in any cell. */
function unplacedPanels(pg: PanelLayoutPage, page: ScriptPage): number[] {
  return page.panels.map((p) => p.num).filter((n) => !pg.panelOrder.includes(n));
}

/* ------------------------------------------------------------------ */

function PanelLayoutPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const savedParam = search.saved ? Number(search.saved) : null;

  const [myScripts, setMyScripts] = useState<SavedScriptSummary[] | null>(null);
  const [scriptsStatus, setScriptsStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [scriptsError, setScriptsError] = useState<string | null>(null);
  const [layoutStatus, setLayoutStatus] = useState<"idle" | "loading" | "ready">("idle");
  const [pageStates, setPageStates] = useState<PanelLayoutPage[] | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const saveInFlight = useRef(false);

  const selected: SavedScriptSummary | null = useMemo(() => {
    if (!myScripts || savedParam === null) return null;
    return myScripts.find((s) => s.id === savedParam) ?? null;
  }, [myScripts, savedParam]);

  useEffect(() => {
    let cancelled = false;
    setScriptsStatus("loading");
    void listScripts({ data: { deviceId: getDeviceId() } }).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setMyScripts(res.scripts);
        setScriptsStatus("ready");
        setScriptsError(null);
      } else {
        setScriptsStatus("error");
        setScriptsError(res.message);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /** When a deep link (?saved=) or a picker card selects a script: show an
   *  instant default sequential layout, then swap in the saved one if it exists. */
  useEffect(() => {
    if (scriptsStatus !== "ready" || !myScripts) return;
    if (savedParam === null) {
      setPageStates(null);
      setNotice(null);
      return;
    }
    const found = myScripts.find((s) => s.id === savedParam);
    if (!found) {
      setPageStates(null);
      setNotice(
        "That script isn't saved on this browser — it may live on another device. Pick one below.",
      );
      return;
    }
    setNotice(null);
    const fresh = buildPageStates(found.script, null);
    setPageStates(fresh);
    setLayoutStatus("loading");
    void getPanelLayout({ data: { deviceId: getDeviceId(), scriptId: found.id } })
      .then((res) => {
        if (res.ok) {
          if (res.layout) {
            setPageStates(buildPageStates(found.script, res.layout));
            setHasSaved(true);
          } else {
            setHasSaved(false);
          }
        } else {
          setNotice(res.message);
        }
        setLayoutStatus("ready");
      })
      .catch(() => {
        setNotice("Couldn't load the saved layout — showing a fresh panel order. You can still save.");
        setLayoutStatus("ready");
      });
  }, [scriptsStatus, myScripts, savedParam]);

  function pickScript(id: number | null) {
    setDirty(false);
    setSaveState("idle");
    setSaveError(null);
    setNotice(null);
    navigate({
      to: "/panel-layout",
      search: (prev) => ({ ...(prev ?? {}), saved: id === null ? undefined : String(id) }),
    });
    if (id === null) setPageStates(null);
  }

  /** An edit happened since the last load/save. */
  function markDirty() {
    setDirty(true);
    setSaveState((s) => (s === "saved" ? "idle" : s));
  }

  function changePagePreset(pageNum: number, presetId: PresetId) {
    if (!selected) return;
    const scriptPage = selected.script.pages.find((p) => p.num === pageNum);
    const preset = presetById(presetId);
    if (!scriptPage || !preset) return;
    setPageStates((prev) => {
      if (!prev) return prev;
      return prev.map((pg) => {
        if (pg.pageNum !== pageNum) return pg;
        const panelNums = scriptPage.panels.map((p) => p.num);
        const used = new Set<number>();
        // Keep assignments that still fit; blank the duplicates/overflow.
        const next = preset.cells.map((_, i) => {
          const v = pg.panelOrder[i];
          if (typeof v === "number" && v > 0 && panelNums.includes(v) && !used.has(v)) {
            used.add(v);
            return v;
          }
          return 0;
        });
        // Fill blanks with still-unplaced panels in script order.
        const fillNums = panelNums.filter((n) => !used.has(n)).sort((a, b) => a - b);
        let fi = 0;
        return { ...pg, preset: preset.id, panelOrder: next.map((v) => (v === 0 ? (fillNums[fi++] ?? 0) : v)) };
      });
    });
    markDirty();
  }

  /** Assign a script panel to a cell. Swap semantics keep the layout
   *  leak-free: a panel can occupy at most one cell, no duplicates. */
  function assignCell(pageNum: number, cellIndex: number, value: number) {
    setPageStates((prev) => {
      if (!prev) return prev;
      return prev.map((pg) => {
        if (pg.pageNum !== pageNum) return pg;
        const order = [...pg.panelOrder];
        if (cellIndex < 0 || cellIndex >= order.length) return pg;
        const old = order[cellIndex];
        if (value === old) return pg;
        if (value !== 0) {
          const otherIdx = order.indexOf(value);
          if (otherIdx !== -1 && otherIdx !== cellIndex) {
            order[otherIdx] = old; // swap with the cell that currently has it
          }
        }
        order[cellIndex] = value;
        return { ...pg, panelOrder: order };
      });
    });
    markDirty();
  }

  /** Place an unplaced panel into the first blank cell (if any). */
  function placeUnplaced(pageNum: number, panelNum: number) {
    setPageStates((prev) => {
      if (!prev) return prev;
      return prev.map((pg) => {
        if (pg.pageNum !== pageNum) return pg;
        if (pg.panelOrder.includes(panelNum)) return pg;
        const free = pg.panelOrder.indexOf(0);
        if (free === -1) return pg;
        const order = [...pg.panelOrder];
        order[free] = panelNum;
        return { ...pg, panelOrder: order };
      });
    });
    markDirty();
  }

  async function handleSave() {
    if (!selected || !pageStates || saveInFlight.current) return;
    saveInFlight.current = true;
    setSaveState("saving");
    setSaveError(null);
    try {
      const res = await savePanelLayout({
        data: {
          deviceId: getDeviceId(),
          scriptId: selected.id,
          layout: { pages: pageStates },
        },
      });
      if (res.ok) {
        setSaveState("saved");
        setDirty(false);
        setHasSaved(true);
      } else {
        setSaveState("error");
        setSaveError(res.message);
      }
    } catch {
      setSaveState("error");
      setSaveError("Something went wrong — try again shortly.");
    } finally {
      saveInFlight.current = false;
    }
  }

  async function handleDeleteLayout() {
    if (!selected) return;
    const sure = window.confirm(
      `Clear the saved layout for “${selected.title}” on this browser? The script itself stays saved.`,
    );
    if (!sure) return;
    try {
      const res = await deletePanelLayout({
        data: { deviceId: getDeviceId(), scriptId: selected.id },
      });
      if (res.ok) {
        setHasSaved(false);
        setSaveState("idle");
        setDirty(false);
        setPageStates(buildPageStates(selected.script, null));
        setNotice("Layout cleared — back to default panel order.");
      } else {
        setNotice(res.message);
      }
    } catch {
      setNotice("Couldn't clear the layout — try again shortly.");
    }
  }

  const navLink = (active: boolean) =>
    `cursor-pointer rounded-sm border-2 px-3 py-1.5 font-display text-sm tracking-widest transition-colors ${
      active
        ? "border-bolt-400 bg-bolt-400/10 text-bolt-300"
        : "border-ink-700 text-white/70 hover:border-white/50 hover:text-white"
    }`;

  return (
    <div className="min-h-dvh overflow-x-clip bg-ink-950 font-sans text-white">
      {/* ---------- Header ---------- */}
      <header className="relative z-30 border-b-2 border-ink-700 bg-ink-950/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-3xl tracking-wide text-white text-pop-sm">
              {BUSINESS}
            </span>
            <span className="hidden rounded-sm border-2 border-panel-cyan px-1.5 py-0.5 font-display text-xs tracking-widest text-panel-cyan sm:inline-block">
              PANEL LAYOUT
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 sm:gap-3" aria-label="Primary">
            <Link to="/" className={navLink(false)}>
              HOME
            </Link>
            <Link to="/script-forge" className={navLink(false)}>
              SCRIPT FORGE
            </Link>
            <Link to="/panel-layout" className={navLink(true)}>
              PANEL LAYOUT
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative overflow-hidden">
        <div className="halftone pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-bolt-400/10 blur-3xl"
          aria-hidden="true"
        />

        {!selected ? (
          /* ---------- (a) Script picker ---------- */
          <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:pb-28">
            <p className="inline-block -rotate-1 rounded-sm border-2 border-panel-cyan px-3 py-1 font-display text-sm tracking-[0.25em] text-panel-cyan text-pop-sm">
              THE SECOND TOOL — LAY OUT THE PAGES
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[0.95] tracking-wide text-pop sm:text-6xl">
              FROM SCRIPT TO <span className="text-bolt-400">PANEL LAYOUT</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/75 sm:text-xl">
              Pick a script saved on this browser, choose a panel preset for each page, assign
              the script's panels to cells — then save the layout, device-scoped, no account
              needed.
            </p>

            <div className="mt-10">
              <h2 className="mb-4 font-display text-3xl tracking-wide text-white text-pop-sm">
                Choose a saved script
              </h2>

              {scriptsStatus === "loading" && (
                <p className="py-2 text-sm text-white/45" role="status">
                  Loading your scripts…
                </p>
              )}

              {scriptsStatus === "error" && (
                <div className="rounded-sm border-2 border-red-400/60 bg-ink-900 px-4 py-3 text-sm text-red-300">
                  {scriptsError ?? "Couldn't load your scripts right now."}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setScriptsStatus("loading");
                      void listScripts({ data: { deviceId: getDeviceId() } }).then((res) => {
                        if (res.ok) {
                          setMyScripts(res.scripts);
                          setScriptsStatus("ready");
                          setScriptsError(null);
                        } else {
                          setScriptsStatus("error");
                          setScriptsError(res.message);
                        }
                      });
                    }}
                    className="ml-1 cursor-pointer font-display tracking-wider text-white underline decoration-bolt-400 underline-offset-2 hover:text-bolt-300"
                  >
                    Retry
                  </button>
                </div>
              )}

              {scriptsStatus === "ready" && myScripts && myScripts.length === 0 && (
                <div className="rounded-sm border-2 border-dashed border-ink-700 bg-ink-950/60 px-6 py-10 text-center">
                  <p className="font-display text-2xl tracking-wide text-white/60 text-pop-sm">
                    NO SAVED SCRIPTS HERE YET
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-white/45">
                    The panel layout tool works from scripts saved to this browser. Forge one
                    first, hit “Save script”, then come back to lay the pages out.
                  </p>
                  <Link
                    to="/script-forge"
                    className="mt-5 inline-block cursor-pointer rounded-sm border-3 border-ink-950 bg-bolt-400 px-5 py-2.5 font-display text-lg tracking-wider text-ink-950 text-pop-sm transition-transform hover:-translate-y-0.5 hover:bg-bolt-300"
                  >
                    → Open the Script Forge
                  </Link>
                </div>
              )}

              {scriptsStatus === "ready" && myScripts && myScripts.length > 0 && (
                <>
                  {notice && (
                    <p className="mb-3 rounded-sm border-2 border-bolt-400/50 bg-ink-900 px-4 py-2 text-sm text-bolt-200" role="status">
                      {notice}
                    </p>
                  )}
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Saved scripts">
                    {myScripts.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => pickScript(s.id)}
                          aria-label={`Lay out “${s.title}”`}
                          className="panel-yellow w-full cursor-pointer rounded-sm bg-ink-850 p-5 text-left transition-transform hover:-translate-y-0.5"
                        >
                          <span className="block truncate font-display text-2xl tracking-wide text-white text-pop-sm">
                            {s.title}
                          </span>
                          <span className="mt-2 block text-xs text-white/50">
                            {s.script.pages.length} page{s.script.pages.length === 1 ? "" : "s"} ·{" "}
                            {s.script.genreLabel} · saved {relativeDate(s.updated_at)}
                          </span>
                          <span className="mt-3 inline-block rounded-sm border-2 border-panel-cyan px-2 py-0.5 font-display text-xs tracking-widest text-panel-cyan">
                            ⬒ LAY OUT
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </section>
        ) : (
          /* ---------- (b) Layout editor ---------- */
          <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:pb-28">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => pickScript(null)}
                  className="cursor-pointer font-display text-xs tracking-widest text-white/50 transition-colors hover:text-bolt-300"
                >
                  ← ALL SCRIPTS
                </button>
                <h1 className="mt-1 truncate font-display text-4xl leading-none tracking-wide text-white text-pop sm:text-5xl">
                  {selected.title}
                </h1>
                <p className="mt-2 text-sm text-white/55">
                  {selected.script.genreLabel} · {selected.script.toneLabel} ·{" "}
                  {selected.script.pages.length} page{selected.script.pages.length === 1 ? "" : "s"} of script
                  {savedParam !== null && (
                    <span className="ml-2 text-white/40">
                      · saved {relativeDate(selected.updated_at)}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!pageStates || saveState === "saving"}
                    aria-label="Save this layout to this browser"
                    className={`cursor-pointer rounded-sm border-2 px-4 py-2 font-display text-base tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      saveState === "saved" && !dirty
                        ? "border-bolt-400 bg-bolt-400 text-ink-950"
                        : "border-bolt-400 bg-ink-950 text-bolt-400 hover:bg-bolt-400 hover:text-ink-950"
                    }`}
                  >
                    {saveState === "saving"
                      ? "Saving…"
                      : saveState === "saved" && !dirty
                        ? "Saved ✓"
                        : "💾 Save layout"}
                  </button>
                  {hasSaved && (
                    <button
                      type="button"
                      onClick={handleDeleteLayout}
                      aria-label="Clear the saved layout for this script"
                      className="cursor-pointer rounded-sm border-2 border-ink-700 px-3 py-2 font-display text-xs tracking-wider text-white/50 transition-colors hover:border-red-400 hover:bg-red-400/10 hover:text-red-300"
                    >
                      ✕ Clear saved layout
                    </button>
                  )}
                </div>
                <div aria-live="polite" className="min-h-5 max-w-md text-right text-xs">
                  {saveState === "saved" && !dirty && (
                    <span className="text-bolt-300">Layout saved to this browser ✓</span>
                  )}
                  {saveState === "saved" && dirty && (
                    <span className="text-white/50">Unsaved changes — save again to update</span>
                  )}
                  {saveState === "error" && (
                    <span className="font-semibold text-red-300">{saveError}</span>
                  )}
                  {notice && <span className="text-white/50">{notice}</span>}
                </div>
              </div>
            </div>

            {layoutStatus === "loading" && (
              <p className="py-4 text-sm text-white/45" role="status">
                Loading the saved layout…
              </p>
            )}

            {layoutStatus === "ready" && pageStates && (
              <div className="space-y-8">
                {pageStates.map((pg, idx) => (
                  <PageEditor
                    key={pg.pageNum}
                    script={selected.script}
                    pageState={pg}
                    pageIndex={idx}
                    onChangePreset={changePagePreset}
                    onAssignCell={assignCell}
                    onPlaceUnplaced={placeUnplaced}
                  />
                ))}
                <p className="text-center text-xs text-white/40">
                  Canvas is a layout outline — numbered cells and text labels, styled like a comic page.
                  Art and lettering come later in the pipeline.
                </p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="border-t-2 border-ink-700 bg-ink-950">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
          <p className="font-display text-2xl tracking-wide text-white">{BUSINESS}</p>
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} {BUSINESS}. Made by creators, for creators.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* One page of the editor: beat info, preset picker, live canvas,      */
/* unplaced panels.                                                    */
/* ------------------------------------------------------------------ */
function PageEditor({
  script,
  pageState,
  pageIndex,
  onChangePreset,
  onAssignCell,
  onPlaceUnplaced,
}: {
  script: ForgedScript;
  pageState: PanelLayoutPage;
  pageIndex: number;
  onChangePreset: (pageNum: number, preset: PresetId) => void;
  onAssignCell: (pageNum: number, cellIndex: number, value: number) => void;
  onPlaceUnplaced: (pageNum: number, panelNum: number) => void;
}) {
  const page = script.pages.find((p) => p.num === pageState.pageNum);
  const preset = presetById(pageState.preset);
  if (!page || !preset) return null;
  const unplaced = unplacedPanels(pageState, page);

  return (
    <section
      aria-label={`Page ${pageState.pageNum} — ${page.beat}`}
      className="panel-yellow rounded-sm bg-ink-850 p-5 sm:p-6"
    >
      <header className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl tracking-wide text-bolt-400 text-pop-sm">
          PAGE {pageState.pageNum}
        </h2>
        <span className="font-display text-xs tracking-[0.2em] text-white/40">
          {page.panels.length} PANELS IN SCRIPT
        </span>
      </header>
      <p className="mb-3 text-sm italic leading-relaxed text-white/60">
        <span className="font-semibold not-italic text-white/80">{page.beat}.</span> {page.purpose}
      </p>

      {/* Preset picker */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Page ${pageState.pageNum} preset`}>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onChangePreset(pageState.pageNum, p.id)}
              aria-pressed={pageState.preset === p.id}
              className={`cursor-pointer rounded-sm border-2 px-2.5 py-1 font-display text-xs tracking-wider transition-colors ${
                pageState.preset === p.id
                  ? "border-bolt-400 bg-bolt-400 text-ink-950"
                  : "border-ink-700 bg-ink-950 text-white/60 hover:border-bolt-400/60 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-white/40">
          {preset.description} — {preset.cells.length} cells in this preset.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        {/* Live page canvas: CSS grid per preset */}
        <div className="mx-auto w-full max-w-[420px]">
          <div
            className="w-full border-4 border-ink-950 bg-ink-950 p-1.5"
            style={{
              display: "grid",
              gap: "6px",
              gridTemplateColumns: `repeat(${preset.cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${preset.rows}, minmax(0, 1fr))`,
              aspectRatio: "2 / 3",
            }}
            role="img"
            aria-label={`Page ${pageState.pageNum} canvas, ${preset.label} layout`}
          >
            {preset.cells.map((c, i) => {
              const panelNum = pageState.panelOrder[i] ?? 0;
              const sp = panelNum ? page.panels.find((p) => p.num === panelNum) : undefined;
              const assignedOther =
                panelNum !== 0 && pageState.panelOrder.filter((v) => v === panelNum).length > 1;
              return (
                <div
                  key={i}
                  className={`relative flex min-h-0 flex-col overflow-hidden border-2 bg-ink-900 ${
                    assignedOther ? "border-red-400" : "border-ink-700"
                  }`}
                  style={{
                    gridColumn: `${c.col} / span ${c.colSpan}`,
                    gridRow: `${c.row} / span ${c.rowSpan}`,
                  }}
                >
                  <div className="flex items-baseline justify-between gap-1 px-1.5 pt-1">
                    <span className="font-display text-lg leading-none tracking-wide text-bolt-400 text-pop-sm">
                      {panelNum ? `PANEL ${panelNum}` : "BLANK"}
                    </span>
                    <span className="font-display text-[10px] tracking-widest text-white/35">
                      {c.name}
                    </span>
                  </div>
                  {sp ? (
                    <p className="mt-0.5 line-clamp-2 px-1.5 text-[10px] leading-snug text-white/70">
                      <span className="font-semibold text-panel-cyan">{sp.shot}</span> — {sp.action}
                    </p>
                  ) : (
                    <p className="mt-0.5 px-1.5 text-[10px] italic leading-snug text-white/35">
                      Empty cell — pick a panel below.
                    </p>
                  )}
                  <select
                    aria-label={`Page ${pageState.pageNum}, cell ${c.name}`}
                    value={panelNum}
                    onChange={(e) => onAssignCell(pageState.pageNum, i, Number(e.target.value))}
                    className="mt-auto w-full cursor-pointer border-t border-ink-700 bg-ink-950 px-1 py-0.5 text-[10px] text-white focus:outline-none"
                  >
                    <option value={0}>— Blank —</option>
                    {page.panels.map((p) => (
                      <option key={p.num} value={p.num}>
                        Panel {p.num} · {p.shot}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
          {pageIndex === 0 && (
            <p className="mt-2 text-center text-[11px] text-white/35">
              Comic page: aspect 2:3, gutters in black ink.
            </p>
          )}
        </div>

        {/* Cell / panel assignment detail */}
        <div className="min-w-0">
          <h3 className="font-display text-lg tracking-widest text-white/80">CELL ASSIGNMENTS</h3>
          <ol className="mt-2 space-y-2">
            {preset.cells.map((c, i) => {
              const panelNum = pageState.panelOrder[i] ?? 0;
              const sp = panelNum ? page.panels.find((p) => p.num === panelNum) : undefined;
              return (
                <li key={i} className="rounded-sm border border-ink-700/80 bg-ink-950/70 px-3 py-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-sm tracking-widest text-white/70">
                      Cell {c.name}
                    </span>
                    {sp ? (
                      <span className="font-display text-[11px] tracking-[0.2em] text-panel-cyan">
                        PANEL {panelNum} · {sp.shot.toUpperCase()}
                      </span>
                    ) : (
                      <span className="font-display text-[11px] tracking-[0.2em] text-white/40">
                        BLANK
                      </span>
                    )}
                  </div>
                  {sp?.action && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/70">
                      {sp.action}
                    </p>
                  )}
                  {sp?.dialogue && sp.dialogue.length > 0 && (
                    <p className="mt-1 line-clamp-1 text-xs text-bolt-300/90">
                      {sp.dialogue[0].speaker}: “{sp.dialogue[0].line}”
                    </p>
                  )}
                  {sp?.sfx && (
                    <p className="mt-0.5 font-display text-sm tracking-widest text-bolt-400">
                      {sp.sfx}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>

          {unplaced.length > 0 && (
            <div className="mt-4">
              <p className="font-display text-sm tracking-widest text-white/60">
                UNPLACED — {unplaced.length} MORE PANEL{unplaced.length === 1 ? "" : "S"} THAN CELLS
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {unplaced.map((n) => {
                  const sp = page.panels.find((p) => p.num === n)!;
                  const hasBlank = pageState.panelOrder.includes(0);
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => onPlaceUnplaced(pageState.pageNum, n)}
                      disabled={!hasBlank}
                      title={
                        hasBlank
                          ? "Place into the first blank cell"
                          : "No blank cells — set a cell to Blank first, or pick a preset with more cells"
                      }
                      className="cursor-pointer rounded-sm border-2 border-panel-cyan/50 bg-ink-950 px-2.5 py-1.5 text-left transition-colors hover:border-panel-cyan disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="block font-display text-xs tracking-widest text-panel-cyan">
                        PANEL {n}
                      </span>
                      <span className="mt-0.5 block max-w-[220px] truncate text-[11px] text-white/60">
                        {sp.shot}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11px] text-white/35">
                Tip: switch to a preset with more cells, or set a cell to Blank and tap a chip to
                place it.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}