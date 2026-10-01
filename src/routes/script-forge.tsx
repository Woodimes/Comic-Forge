import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import site from "../../site.json";
import {
  generateScript,
  scriptToText,
} from "~/lib/scriptgen";
import type { ForgedScript, Genre, PageCount, Tone } from "~/lib/scriptgen";
import { GENRE_LABELS, TONE_LABELS } from "~/lib/scriptgen-pools";
import { SpellCheckField } from "~/components/SpellCheckField";
import { FeedbackForm } from "~/components/FeedbackForm";
import { analyzeNow, firstSuggestion, loadSpellChecker } from "~/lib/spellcheck";
import type { FlaggedWord } from "~/lib/spellcheck";
import { deleteScript, listScripts, saveScript } from "~/lib/saved-scripts";
import type { SavedScriptSummary } from "~/lib/saved-scripts";

export const Route = createFileRoute("/script-forge")({
  head: () => ({
    meta: [
      { title: "ComicForge — Script Forge" },
      {
        name: "description",
        content:
          "Turn a comic idea into a structured, page-by-page script draft — panels, dialogue, and sound effects — with the Script Forge.",
      },
    ],
  }),
  component: ScriptForgePage,
});

const BUSINESS = site.businessName || "ComicForge";

const GENRES = Object.entries(GENRE_LABELS) as [Genre, string][];
const TONES = Object.entries(TONE_LABELS) as [Tone, string][];
const PAGE_COUNTS: PageCount[] = [4, 6, 8];

/** Free-text fields that get client-side spelling checks (selects are excluded). */
const FREE_TEXT_KEYS = ["title", "protagonistName", "protagonistDesc", "obstacle", "setting"] as const;
type FreeTextKey = (typeof FREE_TEXT_KEYS)[number];

interface FormState {
  title: string;
  genre: Genre;
  protagonistName: string;
  protagonistDesc: string;
  obstacle: string;
  setting: string;
  tone: Tone;
  pageCount: PageCount;
}

const EMPTY_FORM: FormState = {
  title: "",
  genre: "superhero",
  protagonistName: "",
  protagonistDesc: "",
  obstacle: "",
  setting: "",
  tone: "dark",
  pageCount: 6,
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const inputBase =
  "w-full rounded-sm border-2 border-ink bg-paper px-4 py-3 text-ink placeholder:text-ink/40 focus:border-flash focus:outline-none";
const labelBase = "mb-1 block font-sans font-bold text-lg tracking-wide text-flash-ink";
const navLink = (active: boolean) =>
  `cursor-pointer rounded-sm border-2 px-3 py-1.5 font-sans font-bold text-sm tracking-widest transition-colors ${
    active
      ? "border-flash bg-flash text-paper"
      : "border-ink/30 text-ink/70 hover:border-flash hover:text-ink"
  }`;

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.title.trim()) errors.title = "Give the comic a title.";
  if (!form.protagonistName.trim()) errors.protagonistName = "Who is the story about?";
  if (!form.protagonistDesc.trim())
    errors.protagonistDesc = "One line on who they are — \"a burned-out detective\", \"a baker with a secret\".";
  return errors;
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "script"
  );
}

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
    // localStorage unavailable (e.g. private mode) — keep one id for this
    // session so save + list still agree with each other.
    fallbackDeviceId ??= `cf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    return fallbackDeviceId;
  }
}

/** Compact relative date for the saved-scripts list. */
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

/** Non-blocking forge-time spelling warning strip under a field. */
function SpellWarning({
  label,
  flags,
  onUseSuggestion,
}: {
  label: string;
  flags: FlaggedWord[];
  onUseSuggestion: (flag: FlaggedWord, suggestion: string) => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Spelling warning for ${label}`}
      className="mt-1.5 space-y-1 rounded-sm border border-flash/40 bg-paper-2 px-2.5 py-2 text-sm"
    >
      {flags.map((flag) => {
        const suggestion = firstSuggestion(flag);
        return (
          <div
            key={`${flag.start}-${flag.word}`}
            className="flex flex-wrap items-center gap-x-1.5 gap-y-1"
          >
            <span className="text-flash-ink">
              {`“${flag.word}” doesn't look right`}
              {suggestion ? ` — maybe “${suggestion}”?` : " — it's not in the dictionary."}
            </span>
            {suggestion && (
              <button
                type="button"
                onClick={() => onUseSuggestion(flag, suggestion)}
                className="cursor-pointer rounded-sm border border-flash bg-paper px-1.5 py-0.5 font-sans font-bold text-[11px] tracking-wider text-flash-ink transition-colors hover:bg-flash-deep hover:text-paper"
              >
                Use suggestion
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ScriptForgePage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [script, setScript] = useState<ForgedScript | null>(null);
  const [forging, setForging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [warnings, setWarnings] = useState<Partial<Record<FreeTextKey, FlaggedWord[]>>>({});
  // --- Saved scripts (device-scoped vault) ---
  const [savedId, setSavedId] = useState<number | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  // Whether the artifact currently on screen is the one stored under savedId.
  // A new forge makes it false (the saved copy is a different draft) while
  // savedId is kept so "save again" still updates the same row.
  const [savedMatches, setSavedMatches] = useState(false);
  // Guards against two Save clicks landing before the first request finishes.
  const saveInFlight = useRef(false);
  const [myScripts, setMyScripts] = useState<SavedScriptSummary[] | null>(null);
  const [scriptsStatus, setScriptsStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [scriptsError, setScriptsError] = useState<string | null>(null);
  const [scriptsOpen, setScriptsOpen] = useState(true);
  const seedRef = useRef<number | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  // The exact form fields the engine used for the current artifact (so a save
  // stores generation-time inputs, even if the form is edited afterwards).
  const inputsRef = useRef<FormState | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    // Editing a field clears its forge-time spelling warning immediately.
    setWarnings((w) =>
      w[key as FreeTextKey] ? { ...w, [key as FreeTextKey]: undefined } : w,
    );
  };

  function runForge() {
    setForging(true);
    setCopied(false);
    setSavedMatches(false); // the artifact on screen is no longer the saved one
    // 600ms "Forging…" flourish — generation itself is instant.
    window.setTimeout(() => {
      const seed =
        seedRef.current === null
          ? (Date.now() ^ hashInputs(form)) >>> 0
          : (seedRef.current + 7919) >>> 0;
      seedRef.current = seed;
      inputsRef.current = { ...form };
      setScript(
        generateScript(
          {
            title: form.title,
            genre: form.genre,
            protagonistName: form.protagonistName,
            protagonistDesc: form.protagonistDesc,
            obstacle: form.obstacle,
            setting: form.setting,
            tone: form.tone,
            pageCount: form.pageCount,
          },
          { seed },
        ),
      );
      setForging(false);
      window.setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }, 600);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    const first = (["title", "protagonistName", "protagonistDesc"] as const).find((k) => errs[k]);
    if (first) {
      (document.getElementById(
        first === "title" ? "sf-title" : first === "protagonistName" ? "sf-protagonist-name" : "sf-protagonist-desc",
      ) as HTMLInputElement | null)?.focus();
      return;
    }
    // Forge regardless of spelling — the warnings below are non-blocking.
    runForge();
    // After forging, surface a spelling warning under any field that still has
    // flagged, not-kept words, with a quick "Use suggestion" action.
    void computePendingWarnings().then(setWarnings);
  }

  /** Re-check every free-text field against the loaded dictionary (loads it on
   *  first submit if it somehow wasn't loaded yet). Never blocks forging. */
  async function computePendingWarnings(): Promise<Partial<Record<FreeTextKey, FlaggedWord[]>>> {
    try {
      await loadSpellChecker();
    } catch {
      return {};
    }
    const warnings: Partial<Record<FreeTextKey, FlaggedWord[]>> = {};
    for (const key of FREE_TEXT_KEYS) {
      const text = form[key];
      if (!text.trim()) continue;
      const flagged = analyzeNow(text);
      if (flagged.length > 0) warnings[key] = flagged;
    }
    return warnings;
  }

  /** Apply a suggestion from a forge-time warning to the field's value, then
   *  clear the warning (the field's own live checker re-validates). */
  function replaceFlaggedWord(key: FreeTextKey, flag: FlaggedWord, suggestion: string) {
    const text = form[key] ?? "";
    const current = analyzeNow(text);
    const hit =
      current.find((f) => f.start === flag.start && f.word === flag.word) ??
      current.find((f) => f.word === flag.word && f.start <= flag.start) ??
      current.find((f) => f.word === flag.word);
    const target = hit ?? flag;
    const start = Math.min(Math.max(target.start, 0), text.length);
    const end = Math.min(Math.max(target.end, start), text.length);
    const next = text.slice(0, start) + suggestion + text.slice(end);
    set(key, next);
    setWarnings((w) => ({ ...w, [key]: undefined }));
  }

  async function handleCopy() {
    if (!script) return;
    const text = scriptToText(script);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard API not available (e.g. insecure context) — fall back to a
      // temporary textarea trick.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
      } finally {
        document.body.removeChild(ta);
      }
    }
    window.setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!script) return;
    const blob = new Blob([scriptToText(script)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(script.title)}-script.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ---------------- Saved scripts (device vault) ---------------- */

  /** Load the creator's saved scripts from the vault. */
  async function refreshScripts(showLoading = true) {
    if (showLoading) setScriptsStatus("loading");
    try {
      const res = await listScripts({ data: { deviceId: getDeviceId() } });
      if (res.ok) {
        setMyScripts(res.scripts);
        setScriptsStatus("ready");
        setScriptsError(null);
      } else {
        setScriptsStatus("error");
        setScriptsError(res.message);
      }
    } catch {
      setScriptsStatus("error");
      setScriptsError("Couldn't load your scripts right now.");
    }
  }

  useEffect(() => {
    void refreshScripts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Save the current artifact. First save inserts; later saves update it in
   *  place (bumping updated_at) — the "Saved ✓" state persists across re-saves. */
  async function handleSave() {
    if (!script || saveInFlight.current) return;
    saveInFlight.current = true;
    setSaveState("saving");
    setSaveError(null);
    try {
      const res = await saveScript({
        data: {
          deviceId: getDeviceId(),
          inputs: inputsRef.current ?? form,
          script,
          id: savedId ?? undefined,
        },
      });
      if (res.ok) {
        setSavedId(res.id);
        setSavedMatches(true);
        setSaveState("saved");
        void refreshScripts(false);
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

  /** Load a saved script: restore the exact form inputs AND render the exact
   *  saved artifact (no regeneration). Re-forge afterwards uses the restored
   *  inputs with a fresh seed, as usual. */
  function handleLoad(row: SavedScriptSummary) {
    setForm({ ...EMPTY_FORM, ...row.inputs });
    inputsRef.current = row.inputs;
    seedRef.current = null;
    setScript(row.script);
    setSavedId(row.id);
    setSavedMatches(true);
    setSaveState("saved");
    setErrors({});
    setWarnings({});
    window.setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  async function handleDelete(e: MouseEvent<HTMLButtonElement>, row: SavedScriptSummary) {
    e.stopPropagation();
    const sure = window.confirm(
      `Delete “${row.title}” from this browser's saved scripts? This can't be undone.`,
    );
    if (!sure) return;
    try {
      const res = await deleteScript({ data: { deviceId: getDeviceId(), id: row.id } });
      if (res.ok) {
        setMyScripts((prev) => (prev ? prev.filter((s) => s.id !== row.id) : prev));
        if (savedId === row.id) {
          setSavedId(null);
          setSavedMatches(false);
          setSaveState("idle");
        }
      } else {
        setScriptsError(res.message);
      }
    } catch {
      setScriptsError("Couldn't delete the script — try again shortly.");
    }
  }

  return (
    <div className="min-h-dvh overflow-x-clip bg-paper font-sans text-ink">
      {/* ---------- Header ---------- */}
      <header className="relative z-30 border-b-2 border-ink bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-3xl tracking-wide text-ink">
              {BUSINESS}
            </span>
            <span className="hidden rounded-sm border-2 border-process px-1.5 py-0.5 font-sans font-bold text-xs tracking-widest text-process sm:inline-block">
              SCRIPT FORGE
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 sm:gap-3" aria-label="Primary">
            <Link to="/" className={navLink(false)}>
              HOME
            </Link>
            <Link to="/script-forge" className={navLink(true)}>
              SCRIPT FORGE
            </Link>
            <Link to="/panel-layout" className={navLink(false)}>
              PANEL LAYOUT
            </Link>
            <a
              href="/#signup"
              className="btn-craft-sm rounded-sm border-3 border-ink bg-flash px-3 py-1.5 font-sans font-bold text-sm tracking-wider text-paper hover:bg-flash-deep"
            >
              Get early access
            </a>
          </nav>
        </div>
      </header>

      <main className="relative overflow-hidden">
        <div className="halftone pointer-events-none absolute inset-0" aria-hidden="true" />

        {/* ---------- Intro ---------- */}
        <section className="relative mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 lg:pt-16">
          <p className="inline-block -rotate-1 rounded-sm border-2 border-process px-3 py-1 font-sans font-bold text-sm tracking-[0.25em] text-process">
            THE FIRST TOOL — LIVE IN THE FORGE
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[0.95] tracking-wide text-pop sm:text-6xl lg:text-7xl">
            FROM IDEA TO <span className="text-flash-ink">SCRIPT</span>, IN ONE PRESS
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70 sm:text-xl">
            Tell us the spark — title, protagonist, the trouble, the tone — and the
            Script Forge drafts a structured comic script: page-by-page beats, panel
            breakdowns, dialogue suggestions, and sound effects.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-ink/60">
            A starting script — refine it into yours. This is a creative drafting tool,
            not finished writing.
          </p>
        </section>

        {/* ---------- Forge + output ---------- */}
        <section className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:pb-28">
          {/* ----- Form ----- */}
          <div className="panel-flash rounded-sm p-6 sm:p-7">
            <span className="absolute -top-4 left-4 rotate-[-2deg] rounded-sm bg-flash px-2 py-0.5 font-sans font-bold text-sm tracking-widest text-paper">
              THE SETUP
            </span>
            <h2 className="mb-5 mt-2 font-display text-3xl tracking-wide text-ink">
              Forge your script
            </h2>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div>
                <label htmlFor="sf-title" className={labelBase}>
                  Title *
                </label>
                <SpellCheckField
                  id="sf-title"
                  name="title"
                  label="the title"
                  value={form.title}
                  onChangeValue={(v) => set("title", v)}
                  placeholder="The Midnight Bell"
                  invalid={Boolean(errors.title)}
                  describedBy={errors.title ? "sf-title-error" : undefined}
                />
                {errors.title && (
                  <p id="sf-title-error" className="mt-1 text-sm font-semibold text-flash-ink">
                    {errors.title}
                  </p>
                )}
                {warnings.title && warnings.title.length > 0 && (
                  <SpellWarning
                    label="the title"
                    flags={warnings.title}
                    onUseSuggestion={(flag, suggestion) =>
                      replaceFlaggedWord("title", flag, suggestion)
                    }
                  />
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sf-genre" className={labelBase}>
                    Genre
                  </label>
                  <select
                    id="sf-genre"
                    name="genre"
                    value={form.genre}
                    onChange={(e) => set("genre", e.target.value as Genre)}
                    className={`${inputBase} cursor-pointer`}
                  >
                    {GENRES.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="sf-tone" className={labelBase}>
                    Tone
                  </label>
                  <select
                    id="sf-tone"
                    name="tone"
                    value={form.tone}
                    onChange={(e) => set("tone", e.target.value as Tone)}
                    className={`${inputBase} cursor-pointer`}
                  >
                    {TONES.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="sf-protagonist-name" className={labelBase}>
                  Protagonist — name *
                </label>
                <SpellCheckField
                  id="sf-protagonist-name"
                  name="protagonistName"
                  label="the protagonist's name"
                  value={form.protagonistName}
                  onChangeValue={(v) => set("protagonistName", v)}
                  placeholder="Mara Quill"
                  invalid={Boolean(errors.protagonistName)}
                  describedBy={errors.protagonistName ? "sf-protagonist-name-error" : undefined}
                />
                {errors.protagonistName && (
                  <p id="sf-protagonist-name-error" className="mt-1 text-sm font-semibold text-flash-ink">
                    {errors.protagonistName}
                  </p>
                )}
                {warnings.protagonistName && warnings.protagonistName.length > 0 && (
                  <SpellWarning
                    label="the protagonist's name"
                    flags={warnings.protagonistName}
                    onUseSuggestion={(flag, suggestion) =>
                      replaceFlaggedWord("protagonistName", flag, suggestion)
                    }
                  />
                )}
              </div>

              <div>
                <label htmlFor="sf-protagonist-desc" className={labelBase}>
                  Protagonist — one-line descriptor *
                </label>
                <SpellCheckField
                  id="sf-protagonist-desc"
                  name="protagonistDesc"
                  label="the protagonist's descriptor"
                  value={form.protagonistDesc}
                  onChangeValue={(v) => set("protagonistDesc", v)}
                  placeholder="a night-shift radio host who hears things the city doesn't"
                  invalid={Boolean(errors.protagonistDesc)}
                  describedBy={errors.protagonistDesc ? "sf-protagonist-desc-error" : undefined}
                />
                {errors.protagonistDesc && (
                  <p id="sf-protagonist-desc-error" className="mt-1 text-sm font-semibold text-flash-ink">
                    {errors.protagonistDesc}
                  </p>
                )}
                {warnings.protagonistDesc && warnings.protagonistDesc.length > 0 && (
                  <SpellWarning
                    label="the protagonist's descriptor"
                    flags={warnings.protagonistDesc}
                    onUseSuggestion={(flag, suggestion) =>
                      replaceFlaggedWord("protagonistDesc", flag, suggestion)
                    }
                  />
                )}
              </div>

              <div>
                <label htmlFor="sf-obstacle" className={labelBase}>
                  Obstacle / antagonist
                </label>
                <SpellCheckField
                  id="sf-obstacle"
                  name="obstacle"
                  label="the obstacle"
                  value={form.obstacle}
                  onChangeValue={(v) => set("obstacle", v)}
                  placeholder="a shadow broker who knows her real name"
                />
                <p className="mt-1 text-xs text-ink/55">Optional — one line. Leave blank and the forge improvises.</p>
                {warnings.obstacle && warnings.obstacle.length > 0 && (
                  <SpellWarning
                    label="the obstacle"
                    flags={warnings.obstacle}
                    onUseSuggestion={(flag, suggestion) =>
                      replaceFlaggedWord("obstacle", flag, suggestion)
                    }
                  />
                )}
              </div>

              <div>
                <label htmlFor="sf-setting" className={labelBase}>
                  Setting
                </label>
                <SpellCheckField
                  id="sf-setting"
                  name="setting"
                  label="the setting"
                  value={form.setting}
                  onChangeValue={(v) => set("setting", v)}
                  placeholder="the rain-slick rooftops of Harbor City"
                />
                <p className="mt-1 text-xs text-ink/55">Optional — one line of place and mood.</p>
                {warnings.setting && warnings.setting.length > 0 && (
                  <SpellWarning
                    label="the setting"
                    flags={warnings.setting}
                    onUseSuggestion={(flag, suggestion) =>
                      replaceFlaggedWord("setting", flag, suggestion)
                    }
                  />
                )}
              </div>

              <div>
                <label htmlFor="sf-pages" className={labelBase}>
                  Page count
                </label>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Page count">
                  {PAGE_COUNTS.map((count) => (
                    <label
                      key={count}
                      className={`cursor-pointer rounded-sm border-2 px-3 py-2.5 text-center font-sans font-bold text-xl tracking-wider transition-colors ${
                        form.pageCount === count
                          ? "border-flash bg-flash/10 text-flash-ink"
                          : "border-ink/30 bg-paper text-ink/65 hover:border-ink hover:text-ink"
                      }`}
                    >
                      <input
                        type="radio"
                        name="pageCount"
                        value={count}
                        checked={form.pageCount === count}
                        onChange={() => set("pageCount", count)}
                        className="sr-only"
                      />
                      {count}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={forging}
                className="btn-craft mt-2 cursor-pointer rounded-sm border-3 border-ink bg-flash px-6 py-3 font-sans font-bold text-2xl tracking-wider text-paper hover:bg-flash-deep disabled:cursor-wait disabled:opacity-70"
              >
                {forging ? "Forging…" : "Forge script →"}
              </button>
            </form>
          </div>

          {/* ----- Output ----- */}
          <div ref={outputRef} className="scroll-mt-24">
            <div className="panel relative rounded-sm">
              <div className="halftone-ink pointer-events-none absolute inset-0 rounded-sm opacity-50" aria-hidden="true" />
              <div className="relative">
                <div className="border-b-2 border-ink bg-paper-2 px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-sans font-bold text-2xl tracking-wide text-ink">
                      THE FORGED SCRIPT
                    </h2>
                    <div className="flex flex-wrap gap-2" aria-label="Script actions">
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={!script || saveState === "saving"}
                        aria-label={
                          saveState === "saved" && savedMatches
                            ? "Script saved to this browser — save again to update it"
                            : saveState === "saved"
                              ? "Save the current draft and update your saved copy"
                              : "Save this script to this browser"
                        }
                        className={`btn-craft-sm cursor-pointer rounded-sm border-2 px-3 py-1.5 font-sans font-bold text-sm tracking-widest disabled:cursor-not-allowed disabled:opacity-40 ${
                          saveState === "saved" && savedMatches
                            ? "border-flash bg-flash text-paper"
                            : "border-flash bg-paper text-flash-ink hover:bg-flash hover:text-paper"
                        }`}
                      >
                        {saveState === "saving"
                          ? "Saving…"
                          : saveState === "saved" && savedMatches
                            ? "Saved ✓"
                            : saveState === "saved"
                              ? "Save update"
                              : "Save script"}
                      </button>
                      <button
                        type="button"
                        onClick={runForge}
                        disabled={!script || forging}
                        className="cursor-pointer rounded-sm border-2 border-flash bg-paper px-3 py-1.5 font-sans font-bold text-sm tracking-widest text-flash-ink transition-colors hover:bg-flash hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {forging ? "Forging…" : "Re-forge"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCopy}
                        disabled={!script}
                        className="cursor-pointer rounded-sm border-2 border-ink bg-paper px-3 py-1.5 font-sans font-bold text-sm tracking-widest text-ink transition-colors hover:border-process hover:text-process disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {copied ? "✓ Copied!" : "Copy script"}
                      </button>
                      <button
                        type="button"
                        onClick={handleDownload}
                        disabled={!script}
                        className="cursor-pointer rounded-sm border-2 border-ink bg-paper px-3 py-1.5 font-sans font-bold text-sm tracking-widest text-ink transition-colors hover:border-process hover:text-process disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Download .txt
                      </button>
                    </div>
                  </div>
                  <div aria-live="polite" className="mt-2 min-h-5 text-xs">
                    {saveState === "saved" && savedMatches && (
                      <span className="text-flash-ink">Saved to this browser ✓</span>
                    )}
                    {saveState === "saved" && !savedMatches && (
                      <span className="text-ink/60">
                        Saved draft on this browser — save again to update it
                      </span>
                    )}
                    {saveState === "error" && (
                      <span className="font-semibold text-flash-ink">{saveError}</span>
                    )}
                  </div>
                </div>

                {!script ? (
                  <div className="flex min-h-[340px] flex-col items-center justify-center gap-4 px-6 py-14 text-center" aria-live="polite">
                    <span className="hatch h-16 w-16 rounded-sm border-2 border-ink/25" aria-hidden="true" />
                    <p className="max-w-sm font-sans font-bold text-2xl tracking-wide text-ink/65">
                      YOUR SCRIPT LANDS HERE
                    </p>
                    <p className="max-w-sm text-sm text-ink/60">
                      Fill in the setup and hit “Forge script”. Pages, panels, dialogue, and
                      SFX appear as soon as the forge cools.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Comic-page scroll area */}
                    <div className="max-h-[72vh] overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
                      <div aria-live="polite">
                        {/* Cover block */}
                        <div className="mb-5 border-3 border-ink bg-paper-3 p-5 text-center" style={{ boxShadow: "6px 6px 0 0 var(--color-flash)" }}>
                          <p className="font-sans font-bold text-lg tracking-widest text-process">
                            {script.genreLabel.toUpperCase()} — {script.toneLabel.toUpperCase()}
                          </p>
                          <h3 className="mt-2 font-display text-4xl leading-none tracking-wide text-ink text-pop sm:text-5xl">
                            {script.title}
                          </h3>
                          <p className="mx-auto mt-3 max-w-md text-sm italic leading-relaxed text-ink/70">
                            {script.logline}
                          </p>
                          <ul className="mx-auto mt-4 flex max-w-md flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-ink/65">
                            {script.cast.map((c) => (
                              <li key={c.role}>
                                <span className="font-semibold text-flash-ink">{c.name}</span> — {c.desc}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Pages */}
                        {script.pages.map((page) => (
                          <section
                            key={page.num}
                            aria-label={page.beat}
                            className="mb-5 rounded-sm border-2 border-ink bg-paper-2 p-4"
                          >
                            <header className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                              <h4 className="font-sans font-bold text-xl tracking-wide text-flash-ink">
                                {page.beat}
                              </h4>
                              <span className="font-sans font-bold text-xs tracking-[0.2em] text-ink/55">
                                {page.panels.length} PANELS
                              </span>
                            </header>
                            <p className="mb-3 text-xs italic leading-relaxed text-ink/60">
                              {page.purpose}
                            </p>
                            <ol className="space-y-3">
                              {page.panels.map((p) => (
                                <li key={p.num} className="rounded-sm border border-ink/25 bg-paper-2 p-3">
                                  <div className="flex items-baseline justify-between gap-2 border-b border-ink/30 pb-1">
                                    <span className="font-sans font-bold text-sm tracking-widest text-flash-ink">
                                      PANEL {p.num}
                                    </span>
                                    <span className="font-sans font-bold text-[11px] tracking-[0.2em] text-process">
                                      {p.shot}
                                    </span>
                                  </div>
                                  {p.action && (
                                    <p className="mt-2 text-sm leading-relaxed text-ink/85">{p.action}</p>
                                  )}
                                  {p.dialogue?.map((d, i) => (
                                    <p key={i} className="mt-1.5 text-sm leading-relaxed">
                                      <span className="mr-1 font-bold text-flash-ink">{d.speaker}:</span>
                                      <span className="text-ink/85">“{d.line}”</span>
                                    </p>
                                  ))}
                                  {p.caption && (
                                    <p className="mt-2 rounded-sm border-l-2 border-process bg-paper-2 px-2 py-1 text-[13px] italic leading-relaxed text-process">
                                      {p.caption}
                                    </p>
                                  )}
                                  {p.sfx && (
                                    <p className="mt-1.5 font-sans font-bold text-lg tracking-widest text-flash-ink">
                                      {p.sfx}
                                    </p>
                                  )}
                                </li>
                              ))}
                            </ol>
                          </section>
                        ))}

                        <p className="pb-1 text-center text-xs text-ink/55">
                          A starting script — refine it into yours. The forge is a draft engine, not a ghostwriter.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- My scripts (device-scoped vault) ---------- */}
        <section
          className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:pb-28"
          aria-label="My saved scripts"
        >
          <div className="panel-flash rounded-sm">
            <button
              type="button"
              onClick={() => setScriptsOpen((o) => !o)}
              aria-expanded={scriptsOpen}
              aria-controls="my-scripts-panel"
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-6 py-4 text-left"
            >
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="rotate-[-2deg] rounded-sm bg-ink px-2 py-0.5 font-sans font-bold text-sm tracking-widest text-paper">
                  THE VAULT
                </span>
                <span className="font-display text-3xl tracking-wide text-ink">
                  My scripts
                </span>
                {myScripts && myScripts.length > 0 && (
                  <span className="rounded-sm border-2 border-process px-1.5 py-0.5 font-sans font-bold text-xs tracking-widest text-process">
                    {myScripts.length}
                  </span>
                )}
              </span>
              <span aria-hidden="true" className="font-sans font-bold text-xl tracking-wide text-flash-ink">
                {scriptsOpen ? "▲" : "▼"}
              </span>
            </button>

            {scriptsOpen && (
              <div id="my-scripts-panel" className="border-t-2 border-ink px-5 py-5 sm:px-6">
                <p className="mb-4 text-sm text-ink/60">
                  Saved to this browser — your scripts live on this device, no account needed.
                  Open any saved script in{" "}
                  <span className="font-semibold text-process">Panel Layout</span> to block out
                  its pages.
                </p>

                {scriptsStatus === "loading" && (
                  <p className="py-2 text-sm text-ink/60" role="status">
                    Loading your scripts…
                  </p>
                )}

                {scriptsStatus === "error" && (
                  <div className="rounded-sm border-2 border-flash/50 bg-paper-2 px-4 py-3 text-sm text-flash-ink">
                    {scriptsError ?? "Couldn't load your scripts right now."}{" "}
                    <button
                      type="button"
                      onClick={() => void refreshScripts()}
                      className="ml-1 cursor-pointer font-sans font-bold tracking-wider text-ink underline decoration-flash underline-offset-2 hover:text-flash-ink"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {scriptsStatus === "ready" && myScripts && myScripts.length === 0 && (
                  <p className="rounded-sm border-2 border-dashed border-ink bg-paper-2 px-4 py-6 text-center text-sm text-ink/60">
                    No saved scripts yet — forge one and hit{" "}
                    <span className="font-semibold text-flash-ink">Save script</span>.
                  </p>
                )}

                {scriptsStatus === "ready" && myScripts && myScripts.length > 0 && (
                  <ul className="space-y-2" aria-label="Saved scripts">
                    {myScripts.map((s) => {
                      const isLoaded = savedId === s.id;
                      return (
                        <li
                          key={s.id}
                          className={`flex items-stretch gap-2 rounded-sm border-2 ${
                            isLoaded
                              ? "border-flash bg-paper-2"
                              : "border-ink/30 bg-paper-2 hover:border-ink/60"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleLoad(s)}
                            aria-current={isLoaded ? "true" : undefined}
                            aria-label={`Load “${s.title}” into the forge`}
                            className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left"
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-sans font-bold text-xl tracking-wide text-ink">
                                {s.title}
                              </span>
                              <span className="mt-0.5 block text-xs text-ink/60">
                                forged {relativeDate(s.updated_at)} · {s.script.pages.length} page
                                {s.script.pages.length === 1 ? "" : "s"}
                              </span>
                            </span>
                            {isLoaded && (
                              <span className="shrink-0 rounded-sm border-2 border-flash px-1.5 py-0.5 font-sans font-bold text-[11px] tracking-widest text-flash-ink">
                                LOADED
                              </span>
                            )}
                          </button>
                          <Link
                            to="/panel-layout"
                            search={{ saved: String(s.id) }}
                            aria-label={`Lay out “${s.title}” in panels`}
                            className="my-2 mr-2 shrink-0 cursor-pointer self-center rounded-sm border-2 border-process px-2 py-1 font-sans font-bold text-xs tracking-wider text-process transition-colors hover:bg-process hover:text-paper"
                          >
                            PANEL LAYOUT
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => void handleDelete(e, s)}
                            aria-label={`Delete “${s.title}”`}
                            className="my-2 mr-2 shrink-0 cursor-pointer self-center rounded-sm border-2 border-ink px-2 py-1 font-sans font-bold text-sm text-ink/60 transition-colors hover:border-flash hover:bg-flash/10 hover:text-flash-ink"
                          >
                            ✕
                          </button>
                        </li>
                      );
                    })}
                    {scriptsError && (
                      <li className="pt-1 text-xs text-flash-ink" role="status">
                        {scriptsError}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ---------- Feedback (inline, collapsed) ---------- */}
        <section className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:pb-28" aria-label="Feedback">
          <FeedbackForm page="script-forge" />
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="border-t-2 border-ink bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
          <p className="font-sans font-bold text-2xl tracking-wide text-ink">{BUSINESS}</p>
          <p className="text-sm text-ink/60">
            © {new Date().getFullYear()} {BUSINESS}. Made by creators, for creators.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* FNV-1a — mirrors the engine's input hashing so each setup gets its own first draft. */
function hashInputs(form: FormState): number {
  let h = 2166136261;
  const parts = [
    form.title,
    form.genre,
    form.protagonistName,
    form.protagonistDesc,
    form.obstacle,
    form.setting,
    form.tone,
    String(form.pageCount),
  ];
  for (const part of parts) {
    for (let i = 0; i < part.length; i++) {
      h ^= part.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= 0xffff;
  }
  return h >>> 0;
}