import { useState } from "react";
import type { FormEvent } from "react";

/* Device identity — same key and shape as the vault (accounts-lite). */
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
    // localStorage unavailable (e.g. private mode) — keep one id for this session.
    fallbackDeviceId ??= `cf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    return fallbackDeviceId;
  }
}

const inputBase =
  "w-full rounded-sm border-2 border-ink-700 bg-ink-950 px-4 py-3 text-white placeholder:text-white/30 focus:border-bolt-400 focus:outline-none";

/**
 * Compact, inline feedback capture — collapsed by default, one textarea plus an
 * optional email. Posts to /api/feedback. Drop it near the bottom of a tool page:
 *   <FeedbackForm page="script-forge" />
 */
export function FeedbackForm({ page }: { page: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setStatus("error");
      setError("Please write a message before sending.");
      return;
    }

    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          deviceId: getDeviceId(),
          page,
          message: trimmed,
          email: email.trim(),
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;
      if (res.ok && data?.ok) {
        setStatus("sent");
        setMessage("");
        setEmail("");
        return;
      }
      setStatus("error");
      setError(data?.message ?? "Couldn't send that — try again shortly.");
    } catch {
      setStatus("error");
      setError("Couldn't send that — check your connection and try again.");
    }
  }

  return (
    <div className="rounded-sm border-2 border-ink-700 bg-ink-900/70">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="feedback-panel"
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-3 text-left"
      >
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="rotate-[-2deg] rounded-sm bg-panel-cyan px-2 py-0.5 font-display text-xs tracking-widest text-ink-950">
            FEEDBACK
          </span>
          <span className="font-display text-xl tracking-wide text-white text-pop-sm">
            Send us feedback
          </span>
          <span className="text-xs text-white/50">
            Using the tool? Tell us what's working and what isn't.
          </span>
        </span>
        <span aria-hidden="true" className="font-display text-lg tracking-wide text-panel-cyan">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div id="feedback-panel" className="border-t-2 border-ink-700 px-5 py-5">
          {status === "sent" ? (
            <p
              className="rounded-sm border-2 border-bolt-400/60 bg-ink-950 px-4 py-3 text-sm text-bolt-200"
              role="status"
            >
              Thanks — this helps us build what creators need.
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
              <div>
                <label
                  htmlFor={`feedback-message-${page}`}
                  className="mb-1 block font-display text-lg tracking-wide text-bolt-400"
                >
                  Your feedback *
                </label>
                <textarea
                  id={`feedback-message-${page}`}
                  name="message"
                  rows={4}
                  maxLength={4000}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  placeholder="What did you try? What worked, what got in the way?"
                  className={`${inputBase} resize-y`}
                />
              </div>

              <div>
                <label
                  htmlFor={`feedback-email-${page}`}
                  className="mb-1 block font-display text-lg tracking-wide text-bolt-400"
                >
                  Email <span className="text-white/40">(optional — if you'd like a reply)</span>
                </label>
                <input
                  id={`feedback-email-${page}`}
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputBase}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="cursor-pointer rounded-sm border-3 border-ink-950 bg-bolt-400 px-4 py-2 font-display text-lg tracking-wider text-ink-950 text-pop-sm transition-transform hover:-translate-y-0.5 hover:bg-bolt-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "sending" ? "Sending…" : "Send feedback"}
                </button>
                <span className="text-xs text-white/40">Goes straight to the team building the forge.</span>
              </div>

              {status === "error" && error && (
                <p className="text-sm font-semibold text-red-300" role="alert">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
