/**
 * Client-side spelling checks for the Script Forge free-text fields.
 *
 * Everything runs in the browser — `nspell` plus the bundled en_US Hunspell
 * dictionary (`dictionary-en`). The dictionary is code-split behind a dynamic
 * import and is only loaded once a spell-checked field receives focus, then
 * kept cached for the rest of the page session. Zero runtime network/API.
 *
 * `dictionary-en`'s own entry point reads its files with `node:fs`, which
 * cannot run in a browser, so we import its raw `.aff`/`.dic` assets instead
 * (Vite `?raw`, which inlines them as strings). en_US for now.
 */

export interface WordToken {
  readonly word: string;
  /** Character offset (in the original string) where the word starts. */
  readonly start: number;
  /** Character offset (exclusive) where the word ends. */
  readonly end: number;
}

export interface FlaggedWord extends WordToken {
  /** Top dictionary suggestions (0–3). Empty means "no close match". */
  readonly suggestions: string[];
}

export type SpellState = "idle" | "loading" | "ready" | "error";

interface Spell {
  correct(word: string): boolean;
  suggest(word: string): string[];
}

const WORD_RE = /[A-Za-z][A-Za-z'’-]*/g;
const MAX_SUGGESTIONS = 3;
const IGNORE_KEY = "comicforge.ignored-words.v1";

/** Split free text into word tokens with their character offsets. */
export function tokenizeWords(text: string): WordToken[] {
  const tokens: WordToken[] = [];
  WORD_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = WORD_RE.exec(text)) !== null) {
    tokens.push({ word: m[0], start: m.index, end: m.index + m[0].length });
  }
  return tokens;
}

/* ------------------------------------------------------------------ */
/* Keep / Ignore — remembered per word for the session (client-side).  */
/* ------------------------------------------------------------------ */

function readIgnored(): Set<string> {
  const set = new Set<string>();
  if (typeof window === "undefined") return set;
  try {
    const raw = window.sessionStorage.getItem(IGNORE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const w of parsed) {
          if (typeof w === "string") set.add(w.toLowerCase());
        }
      }
    }
  } catch {
    // sessionStorage can throw (privacy modes) — session-only memory is fine.
  }
  return set;
}

let ignoredWords: Set<string> = readIgnored();

/** Remember `word` for the session so it stops being flagged. */
export function keepWord(word: string): void {
  ignoredWords.add(word.toLowerCase());
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(IGNORE_KEY, JSON.stringify([...ignoredWords]));
    } catch {
      // non-fatal — already kept in memory for this session
    }
  }
}

export function isWordKept(word: string): boolean {
  return ignoredWords.has(word.toLowerCase());
}

/** Heuristic skips: single letters, alphanumerics (X-19, V5) — noise, not typos. */
function isHeuristicSkip(token: string): boolean {
  if (token.length < 2) return true;
  if (/\d/.test(token)) return true;
  return false;
}

/* ------------------------------------------------------------------ */
/* nspell + dictionary — lazy-loaded once, cached forever.             */
/* ------------------------------------------------------------------ */

let spellPromise: Promise<Spell> | null = null;
let readySpell: Spell | null = null;

/**
 * Load (and cache) the spell checker. Only called from focus/submit
 * handlers, never at page load — the dictionary chunk is fetched the first
 * time the user interacts with a free-text field.
 */
export function loadSpellChecker(): Promise<Spell> {
  if (readySpell) return Promise.resolve(readySpell);
  if (!spellPromise) {
    spellPromise = (async () => {
      const [{ default: nspell }, aff, dic] = await Promise.all([
        import("nspell"),
        import("../../node_modules/dictionary-en/index.aff?raw"),
        import("../../node_modules/dictionary-en/index.dic?raw"),
      ]);
      const instance = nspell(aff.default, dic.default);
      readySpell = instance;
      return instance;
    })();
    // Allow a retry if the initial load fails.
    spellPromise = spellPromise.catch((err) => {
      spellPromise = null;
      throw err;
    });
  }
  return spellPromise;
}

export function isSpellReady(): boolean {
  return readySpell !== null;
}

/** Synchronous check — returns [] while the dictionary isn't loaded yet. */
export function analyzeNow(text: string): FlaggedWord[] {
  if (!readySpell) return [];
  return analyzeText(readySpell, text);
}

/** Analyze `text` against a loaded spell checker; [] when nothing to fix. */
export function analyzeText(spell: Spell, text: string): FlaggedWord[] {
  const flags: FlaggedWord[] = [];
  for (const tok of tokenizeWords(text)) {
    if (isWordKept(tok.word)) continue;
    const normalized = tok.word.replace(/[’‘]/g, "'");
    if (isHeuristicSkip(normalized)) continue;
    if (spell.correct(normalized)) continue;
    const upper = matchCase(normalized, rankSuggestions(normalized, spell.suggest(normalized)));
    const seen = new Set<string>();
    const suggestions: string[] = [];
    for (const s of upper) {
      const key = s.toLowerCase();
      if (key === normalized.toLowerCase() || seen.has(key)) continue;
      seen.add(key);
      suggestions.push(s);
      if (suggestions.length >= MAX_SUGGESTIONS) break;
    }
    flags.push({ word: tok.word, start: tok.start, end: tok.end, suggestions });
  }
  return flags;
}

/**
 * Rank nspell's raw candidates: typos almost never change the first letter,
 * so candidates sharing it are the useful ones; nearest edit distance first
 * (nspell's own order is alphabetical, not distance-sorted). Falls back to
 * the raw list when nothing shares the first letter, so oddball-but-valid
 * words still surface rather than nothing at all.
 */
function rankSuggestions(word: string, raw: string[]): string[] {
  const lowerWord = word.toLowerCase();
  const scored = raw
    .map((s, i) => ({ s, i, d: levenshtein(lowerWord, s.toLowerCase()) }))
    .filter(({ s }) => s.charAt(0).toLowerCase() === lowerWord.charAt(0));
  const pool = scored.length > 0 ? scored : raw.map((s, i) => ({ s, i, d: levenshtein(lowerWord, s.toLowerCase()) }));
  return pool
    .slice()
    .sort((a, b) => a.d - b.d || a.i - b.i)
    .map((x) => x.s);
}

/** Classic Levenshtein distance — candidates here are tiny, this is cheap. */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/** First suggestion for a flagged word, or "" when there is none. */
export function firstSuggestion(flag: FlaggedWord): string {
  return flag.suggestions[0] ?? "";
}

/** Mirror the original word's casing onto suggestions (Jck → Jack, JCK → JACK). */
function matchCase(original: string, suggestions: string[]): string[] {
  const allCaps = original !== original.toLowerCase() && original === original.toUpperCase();
  const firstCap = /^[A-Z]/.test(original);
  return suggestions.map((s) => {
    if (allCaps) return s.toUpperCase();
    if (firstCap) return s.charAt(0).toUpperCase() + s.slice(1);
    return s;
  });
}