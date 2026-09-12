/**
 * Script Forge — deterministic generation engine.
 *
 * Pure, client-side: `generateScript(input, opts)` returns a structured comic
 * script with no network, no LLM, no randomness beyond a caller-supplied seed.
 *
 * This module is the seam for the future: the UI only imports from here, so an
 * AI backend can later replace `generateScript`'s internals (or add an async
 * variant) without touching the form or the output renderer.
 */
import type { Genre, GenrePack, ScenePanel, Tone } from "./scriptgen-pools";
import { GENRE_LABELS, PACKS, TONE_LABELS, TONES } from "./scriptgen-pools";

export type { Genre, Tone } from "./scriptgen-pools";

export type PageCount = 4 | 6 | 8;

export interface ForgeInput {
  title: string;
  genre: Genre;
  protagonistName: string;
  protagonistDesc: string;
  obstacle: string;
  setting: string;
  tone: Tone;
  pageCount: PageCount;
}

export interface DialogueLine {
  speaker: string;
  line: string;
}

export interface ScriptPanel {
  num: number;
  shot: string;
  action: string;
  dialogue?: DialogueLine[];
  sfx?: string;
  caption?: string;
}

export interface ScriptPage {
  num: number;
  beat: string;
  purpose: string;
  panels: ScriptPanel[];
}

export interface ForgedScript {
  engine: "deterministic-template";
  title: string;
  genreLabel: string;
  toneLabel: string;
  logline: string;
  cast: { name: string; desc: string; role: string }[];
  pages: ScriptPage[];
}

/* ------------------------------------------------------------------ */
/* Small deterministic RNG (mulberry32) — same seed, same script.      */
/* ------------------------------------------------------------------ */

type Rng = () => number;

function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash a string into a 32-bit seed. */
function hashSeed(...parts: string[]): number {
  let h = 2166136261;
  for (const part of parts) {
    for (let i = 0; i < part.length; i++) {
      h ^= part.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= 0xffff; // separator
  }
  return h >>> 0;
}

const pick = <T,>(r: Rng, arr: T[]): T => arr[Math.floor(r() * arr.length) % arr.length];

/** Title-case the first letter of a phrase, for mid-sentence use. */
function soft(phrase: string): string {
  return phrase.trim().replace(/[.,;:!?]+$/, "").trim();
}

function fill(template: string, ctx: { name: string; obstacle: string; setting: string }): string {
  return template
    .replace(/\{NAME\}/g, ctx.name)
    .replace(/\{OBSTACLE\}/g, soft(ctx.obstacle))
    .replace(/\{SETTING\}/g, soft(ctx.setting));
}

/* ------------------------------------------------------------------ */
/* Beat layouts                                                        */
/* ------------------------------------------------------------------ */

interface BeatSpec {
  label: string;
  purpose: string;
  scene: keyof GenrePack["scenes"];
}

const LAYOUTS: Record<PageCount, BeatSpec[]> = {
  4: [
    {
      label: "THE HOOK",
      purpose: "World, stakes, and protagonist introduced in four tight panels — and a door that's about to slam open.",
      scene: "hook",
    },
    {
      label: "THE INCITING INCIDENT",
      purpose: "Everything changes. The story's engine fires, and there's no un-ringing this bell.",
      scene: "incite",
    },
    {
      label: "THE TURN",
      purpose: "The plan dies in front of us, the rug comes out, and the floor drops away in the same panel.",
      scene: "twist",
    },
    {
      label: "THE CLIMAX & THE AFTERMATH",
      purpose: "One last stand, the choice that counts, and the moment after — when the dust decides what the story meant.",
      scene: "climax",
    },
  ],
  6: [
    { label: "THE HOOK", purpose: "World, stakes, and protagonist introduced — and a first hint that something is off.", scene: "hook" },
    { label: "THE INCITING INCIDENT", purpose: "The ordinary breaks. The engine fires. No turning back.", scene: "incite" },
    { label: "RISING ACTION", purpose: "The chase escalates, the cost climbs, and each win is heavier than the last.", scene: "rise" },
    { label: "THE MIDPOINT TWIST", purpose: "The floor drops out: the truth behind the trouble changes the whole story.", scene: "twist" },
    { label: "THE LOW POINT", purpose: "Out of options, out of allies, out of light. This is the panel that earns the ending.", scene: "low" },
    { label: "THE CLIMAX", purpose: "Everything paid for in one page — and the price is a little different than expected.", scene: "climax" },
  ],
  8: [
    { label: "THE HOOK", purpose: "World, stakes, and protagonist introduced — and a first hint that something is off.", scene: "hook" },
    { label: "THE INCITING INCIDENT", purpose: "The ordinary breaks. The engine fires. No turning back.", scene: "incite" },
    { label: "RISING ACTION", purpose: "The chase escalates, the cost climbs, and each win is heavier than the last.", scene: "rise" },
    { label: "THE MIDPOINT TWIST", purpose: "The floor drops out: the truth behind the trouble changes the whole story.", scene: "twist" },
    { label: "THE LOW POINT", purpose: "Out of options, out of allies, out of light. This is the page that earns the ending.", scene: "low" },
    { label: "THE CLIMAX", purpose: "Everything paid for in one page — no time to think, only to choose.", scene: "climax" },
    { label: "THE RESOLUTION", purpose: "The dust settles. What the ordeal was for, and what it cost, comes into focus.", scene: "resolve" },
    { label: "WHAT COMES NEXT", purpose: "A breath — then the next storm, glimpsed at the very edge of the frame.", scene: "tease" },
  ],
};

/* ------------------------------------------------------------------ */
/* Composition                                                         */
/* ------------------------------------------------------------------ */

interface Ctx {
  name: string;
  obstacle: string;
  setting: string;
}

function buildScenePanel(
  sp: ScenePanel,
  num: number,
  ctx: Ctx,
): ScriptPanel {
  const panel: ScriptPanel = {
    num,
    shot: sp.shot,
    action: fill(sp.action, ctx),
  };
  if (sp.dialogue && sp.dialogue.length > 0) {
    panel.dialogue = sp.dialogue.map((l) => ({ speaker: ctx.name, line: fill(l, ctx) }));
  }
  if (sp.sfx) panel.sfx = sp.sfx;
  if (sp.caption) panel.caption = fill(sp.caption, ctx);
  return panel;
}

/**
 * Build one page: pick a scene for the beat (and, where the layout is short,
 * splice in panels from a second scene), attach a tone caption to a middle
 * panel, and cap the page with a page-turn hook. The final page turns on the
 * story's cliffhanger instead of a generic hook.
 */
function composePage(
  r: Rng,
  pack: GenrePack,
  tone: Tone,
  beat: BeatSpec,
  pageNum: number,
  pageCount: PageCount,
  ctx: Ctx,
  spliceScene?: keyof GenrePack["scenes"],
): ScriptPage {
  const primary = pick(r, pack.scenes[beat.scene]);
  let panels = [...primary.panels];

  if (spliceScene) {
    const extra = pick(r, pack.scenes[spliceScene]);
    // Splice 1–2 panels from the second scene into the middle of the page.
    const take = 1 + Math.floor(r() * Math.min(2, extra.panels.length));
    const at = Math.min(panels.length - 1, 1 + Math.floor(r() * 2));
    panels.splice(at, 0, ...extra.panels.slice(0, take));
  }

  // Inject a tone-flavoured caption into a middle panel of most pages.
  if (pageNum > 1 && panels.length > 1) {
    const target = panels[Math.floor(panels.length / 2)];
    if (!target.caption) {
      target.caption = pick(r, TONES[tone].captions);
    }
  }

  const isLast = pageNum === pageCount;

  // Cap with a page-turn hook: caption (most common), sfx burst, or a line.
  const hook = makeTurnHook(r, pack, ctx, isLast);
  if (hook) panels.push(hook);

  // Guard the 3–6 panel rule after splicing + hook.
  if (panels.length > 6) {
    panels = panels.slice(0, 6);
  }

  const numbered = panels.map((p, i) => buildScenePanel(p, i + 1, ctx));

  return {
    num: pageNum,
    beat: `PAGE ${pageNum} — ${beat.label}`,
    purpose: beat.purpose,
    panels: numbered,
  };
}

function makeTurnHook(
  r: Rng,
  pack: GenrePack,
  ctx: Ctx,
  isLast: boolean,
): ScenePanel | null {
  const roll = r();
  if (isLast) {
    // The final page ends on the story's cliffhanger, pulled from the teaser
    // pool or a genre sfx — no generic caption.
    if (roll < 0.72) {
      const tease = pick(r, pack.scenes.tease);
      const last = tease.panels[tease.panels.length - 1];
      return { shot: "INSERT", action: fill(last.action, ctx), caption: last.caption ? fill(last.caption, ctx) : undefined };
    }
    return { shot: "CLOSE ON", action: "The frame holds on the one detail that must not be forgotten.", sfx: pick(r, pack.sfx) };
  }
  if (roll < 0.72) {
    return { shot: "CAPTION", action: fill(pick(r, pack.turns), ctx), caption: undefined };
  }
  if (roll < 0.86) {
    return { shot: "SFX BEAT", action: "", sfx: pick(r, pack.sfx) };
  }
  return { shot: "CLOSE ON", action: fill(pick(r, pack.turns), ctx) };
}

/* ------------------------------------------------------------------ */
/* Logline                                                             */
/* ------------------------------------------------------------------ */

function buildLogline(input: ForgeInput): string {
  const tone = TONES[input.tone];
  const genreLabel = GENRE_LABELS[input.genre];
  const name = input.protagonistName.trim();
  const desc = soft(input.protagonistDesc) || "a stranger in a strange situation";
  const obstacle = soft(input.obstacle) || "a problem with no name";
  const setting = soft(input.setting) || "a world that is about to get loud";
  return (
    `In this ${tone.word} ${genreLabel.toLowerCase()} tale, ${name}, ${desc}, runs headlong into ${obstacle} — ` +
    `and everything in ${setting} is about to change${tone.ending}`
  );
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export interface GenerateOptions {
  /** Deterministic seed. Omit for a stable script from the inputs; pass a new
   *  value (e.g. incrementing) to "re-forge" a fresh variation. */
  seed?: number;
}

/**
 * The sole entry point the UI uses. Replace this implementation with an LLM
 * backend later and the UI keeps working unchanged.
 */
export function generateScript(input: ForgeInput, opts: GenerateOptions = {}): ForgedScript {
  const tone = TONES[input.tone];
  const pack = PACKS[input.genre];
  const ctx: Ctx = {
    name: input.protagonistName.trim(),
    obstacle: input.obstacle,
    setting: input.setting,
  };

  const baseSeed =
    opts.seed ??
    hashSeed(
      input.title,
      input.genre,
      input.protagonistName,
      input.protagonistDesc,
      input.obstacle,
      input.setting,
      input.tone,
      String(input.pageCount),
    );
  const r = mulberry32(baseSeed);

  const layout = LAYOUTS[input.pageCount];
  const pages: ScriptPage[] = [];

  const spliceFor: Partial<Record<PageCount, Record<number, keyof GenrePack["scenes"]>>> = {
    4: { 3: "low" }, // the midpoint-twist page carries the low point in the short form
    6: { 6: "resolve" }, // final page folds in a beat of resolution
  };

  layout.forEach((beat, i) => {
    const pageNum = i + 1;
    const splice = spliceFor[input.pageCount]?.[pageNum];
    pages.push(composePage(r, pack, input.tone, beat, pageNum, input.pageCount, ctx, splice));
  });

  return {
    engine: "deterministic-template",
    title: input.title.trim(),
    genreLabel: pack.label,
    toneLabel: tone.label,
    logline: buildLogline(input),
    cast: [
      { name: ctx.name || "—", desc: soft(input.protagonistDesc), role: "protagonist" },
      { name: soft(input.obstacle) || "—", desc: "the obstacle", role: "antagonist / obstacle" },
    ],
    pages,
  };
}

/* ------------------------------------------------------------------ */
/* Plain-text serialisation (for copy + download)                      */
/* ------------------------------------------------------------------ */

export function scriptToText(script: ForgedScript): string {
  const lines: string[] = [];
  lines.push(script.title.toUpperCase());
  lines.push("=".repeat(Math.max(24, script.title.length)));
  lines.push("");
  lines.push(`GENRE:   ${script.genreLabel}`);
  lines.push(`TONE:    ${script.toneLabel}`);
  lines.push(`PAGES:   ${script.pages.length}`);
  lines.push("");
  lines.push("LOGLINE");
  lines.push(script.logline);
  lines.push("");
  lines.push("CAST");
  for (const c of script.cast) {
    lines.push(`  ${c.name} — ${c.desc} (${c.role})`);
  }
  lines.push("");
  for (const page of script.pages) {
    lines.push("─".repeat(56));
    lines.push(page.beat.toUpperCase());
    lines.push(page.purpose);
    lines.push("");
    for (const p of page.panels) {
      lines.push(`PANEL ${p.num} — ${p.shot}`);
      if (p.action) lines.push(p.action);
      if (p.dialogue) {
        for (const d of p.dialogue) lines.push(`  ${d.speaker}: "${d.line}"`);
      }
      if (p.caption) lines.push(`  [CAPTION] ${p.caption}`);
      if (p.sfx) lines.push(`  [SFX] ${p.sfx}`);
      lines.push("");
    }
  }
  lines.push("─".repeat(56));
  lines.push("THE END (for now.)");
  lines.push("");
  lines.push("A starting script — refine it into yours.");
  return lines.join("\n");
}