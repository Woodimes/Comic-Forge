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
  "w-full rounded-sm border-2 border-ink bg-paper px-4 py-3 text-ink placeholder:text-ink/40 focus:border-flash focus:outline-none";

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
    <div className="rounded-sm border-2 border-ink bg-paper-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="feedback-panel"
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-3 text-left"
      >
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="rotate-[-2deg] rounded-sm bg-process px-2 py-0.5 font-sans font-bold text-xs tracking-widest text-paper">
            FEEDBACK
          </span>
          <span className="font-sans font-bold text-xl tracking-wide text-ink">
            Send us feedback
          </span>
          <span className="text-xs text-ink/60">
            Using the tool? Tell us what's working and what isn't.
          </span>
        </span>
        <span aria-hidden="true" className="font-sans font-bold text-lg tracking-wide text-process">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div id="feedback-panel" className="border-t-2 border-ink px-5 py-5">
          {status === "sent" ? (
            <p
              className="rounded-sm border-2 border-flash/40 bg-paper px-4 py-3 text-sm text-flash-ink"
              role="status"
            >
              Thanks — this helps us build what creators need.
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
              <div>
                <label
                  htmlFor={`feedback-message-${page}`}
                  className="mb-1 block font-sans font-bold text-lg tracking-wide text-flash-ink"
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
                  className="mb-1 block font-sans font-bold text-lg tracking-wide text-flash-ink"
                >
                  Email <span className="text-ink/55">(optional — if you'd like a reply)</span>
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
                  className="btn-craft cursor-pointer rounded-sm border-3 border-ink bg-flash px-4 py-2 font-sans font-bold text-lg tracking-wider text-paper hover:bg-flash-deep disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "sending" ? "Sending…" : "Send feedback"}
                </button>
                <span className="text-xs text-ink/55">Goes straight to the team building the forge.</span>
              </div>

              {status === "error" && error && (
                <p className="text-sm font-semibold text-flash-ink" role="alert">
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
