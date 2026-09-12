import { useEffect, useMemo, useRef, useState } from "react";
import type { FocusEvent } from "react";
import { analyzeNow, keepWord, loadSpellChecker } from "~/lib/spellcheck";
import type { FlaggedWord, SpellState, WordToken } from "~/lib/spellcheck";

interface SpellCheckFieldProps {
  id: string;
  name?: string;
  /** Human label used in the suggestion panel's aria-label. */
  label: string;
  value: string;
  onChangeValue: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  invalid?: boolean;
  /** id of an existing helper/error paragraph to include in aria-describedby. */
  describedBy?: string;
  /** Lifted up to the page so the forge-time warning can read current flags. */
  onFlagsChange?: (flags: FlaggedWord[]) => void;
}

interface Segment {
  text: string;
  flag?: FlaggedWord;
}

const DEBOUNCE_MS = 300;

/**
 * Single-line text input with live client-side spelling checks:
 * red wavy underline under likely misspellings, a "did you mean" / Keep
 * suggestion panel below the field, and click-to-replace. The dictionary is
 * lazy-loaded on first focus and then cached. Everything is cosmetic/non-
 * blocking — the field never blocks on spelling.
 */
export function SpellCheckField({
  id,
  name,
  label,
  value,
  onChangeValue,
  placeholder,
  autoComplete = "off",
  invalid,
  describedBy,
  onFlagsChange,
}: SpellCheckFieldProps) {
  const [state, setState] = useState<SpellState>("idle");
  const [flags, setFlags] = useState<FlaggedWord[]>([]);
  const bootstrappedRef = useRef(false);
  const mountedRef = useRef(true);
  const flagsCbRef = useRef(onFlagsChange);
  flagsCbRef.current = onFlagsChange;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* Lift the current flags up to the page whenever they change. */
  useEffect(() => {
    flagsCbRef.current?.(flags);
  }, [flags]);

  /* Debounce analysis while typing; only runs once the dictionary is ready. */
  useEffect(() => {
    if (state !== "ready") return;
    const t = window.setTimeout(() => {
      if (mountedRef.current) setFlags(analyzeNow(value));
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [value, state]);

  function ensureLoaded(_e: FocusEvent<HTMLInputElement>) {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    setState("loading");
    loadSpellChecker()
      .then(() => {
        if (mountedRef.current) setState("ready");
      })
      .catch(() => {
        if (mountedRef.current) setState("error");
      });
  }

  /** Locate a flag against the *current* value before mutating it (offsets
   *  can shift while the debounce is pending). Best effort, never crashes. */
  function currentFlag(flag: FlaggedWord): FlaggedWord | undefined {
    const current = analyzeNow(value);
    return (
      current.find((f) => f.start === flag.start && f.word === flag.word) ??
      current.find((f) => f.word === flag.word && f.start <= flag.start) ??
      current.find((f) => f.word === flag.word)
    );
  }

  function replaceWord(flag: FlaggedWord, replacement: string) {
    const hit = currentFlag(flag) ?? flag;
    const start = Math.min(hit.start, value.length);
    const end = Math.min(hit.end, value.length);
    const next = value.slice(0, start) + replacement + value.slice(end);
    onChangeValue(next);
    // Refresh flags immediately against the new value.
    if (mountedRef.current) setFlags(analyzeNow(next));
  }

  function handleKeep(flag: FlaggedWord) {
    keepWord(flag.word);
    if (mountedRef.current) setFlags(analyzeNow(value));
  }

  /* Mirror text: same font/metrics as the input, transparent glyphs, wavy
     red underline under flagged words. Sits underneath the actual input. */
  const segments: Segment[] = useMemo(() => {
    const out: Segment[] = [];
    if (!flags.length) {
      return [{ text: value }];
    }
    let cursor = 0;
    for (const flag of flags) {
      const start = Math.min(Math.max(flag.start, 0), value.length);
      const end = Math.min(Math.max(flag.end, start), value.length);
      if (start > cursor) out.push({ text: value.slice(cursor, start) });
      if (end > start) {
        out.push({ text: value.slice(start, end), flag });
      }
      cursor = Math.max(cursor, end);
    }
    if (cursor < value.length) out.push({ text: value.slice(cursor) });
    return out;
  }, [value, flags]);

  const describedByIds =
    [describedBy, flags.length > 0 ? `${id}-suggest` : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="relative">
      <div
        className={`relative w-full rounded-sm border-2 bg-ink-950 px-4 py-3 transition-colors focus-within:border-bolt-400 ${
          invalid ? "border-red-400/80" : "border-ink-700"
        }`}
      >
        {/* Underline mirror — purely decorative, never interactive. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center overflow-hidden px-4"
        >
          <span className="whitespace-pre text-base text-transparent">
            {segments.map((seg, i) =>
              seg.flag ? (
                <span
                  key={i}
                  className="underline decoration-wavy decoration-red-400 decoration-2 underline-offset-2 [text-decoration-skip-ink:none]"
                >
                  {seg.text}
                </span>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </span>
        </div>
        <input
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          onFocus={ensureLoaded}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={invalid ? true : undefined}
          aria-describedby={describedByIds}
          className="relative w-full border-0 bg-transparent p-0 text-base text-white caret-bolt-400 placeholder:text-white/30 focus:outline-none"
        />
      </div>

      {state === "ready" && flags.length > 0 && (
        <div
          id={`${id}-suggest`}
          role="group"
          aria-label={`Spelling suggestions for ${label}`}
          className="mt-2 space-y-1.5 rounded-sm border border-red-400/50 bg-red-950/40 px-2.5 py-2"
        >
          {flags.map((flag: FlaggedWord & WordToken) => (
            <div
              key={`${flag.start}-${flag.word}`}
              className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm"
            >
              <span className="font-semibold text-red-300">{`“${flag.word}”`}</span>
              {flag.suggestions.length > 0 ? (
                <>
                  <span className="text-xs text-white/55">did you mean</span>
                  {flag.suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => replaceWord(flag, s)}
                      className="cursor-pointer rounded-sm border border-bolt-400/70 bg-ink-950 px-1.5 py-0.5 font-display text-xs tracking-wider text-bolt-300 transition-colors hover:bg-bolt-400 hover:text-ink-950"
                    >
                      {s}
                    </button>
                  ))}
                </>
              ) : (
                <span className="text-xs text-white/45">isn't in our dictionary</span>
              )}
              <button
                type="button"
                onClick={() => handleKeep(flag)}
                aria-label={`Keep “${flag.word}” — don't flag it again this session`}
                className="cursor-pointer rounded-sm border border-ink-700 bg-ink-950 px-1.5 py-0.5 font-display text-[11px] tracking-wider text-white/70 transition-colors hover:border-white/60 hover:text-white"
              >
                Keep “{flag.word}”
              </button>
            </div>
          ))}
        </div>
      )}

      {state === "error" && (
        <p className="mt-1 text-xs text-white/40">Spelling check unavailable — forging works as usual.</p>
      )}
    </div>
  );
}