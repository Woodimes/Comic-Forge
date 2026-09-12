import { useState } from "react";
import type { FormEvent } from "react";
import { joinWaitlist } from "~/lib/waitlist";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

type FieldErrors = { name?: string; email?: string };

export function WaitlistForm({ id }: { id: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const nameErrorId = `${id}-name-error`;
  const emailErrorId = `${id}-email-error`;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = "Please enter your name.";
    if (!email.trim()) errors.email = "Please enter your email.";
    else if (!EMAIL_RE.test(email.trim()))
      errors.email = "That email doesn't look right — check it and try again.";
    setFieldErrors(errors);
    if (errors.name || errors.email) {
      setStatus({ kind: "idle" });
      return;
    }

    setStatus({ kind: "submitting" });
    try {
      const res = await joinWaitlist({ data: { name, email } });
      if (res.ok) {
        setName("");
        setEmail("");
        setStatus({ kind: "success", message: res.message });
      } else {
        setStatus({ kind: "error", message: res.message });
      }
    } catch {
      setStatus({ kind: "error", message: "Something went wrong — try again shortly." });
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <div>
          <label
            htmlFor={`${id}-name`}
            className="mb-1 block font-display text-lg tracking-wide text-bolt-400"
          >
            Name
          </label>
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Alex Creator"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={fieldErrors.name ? true : undefined}
            aria-describedby={fieldErrors.name ? nameErrorId : undefined}
            className="w-full rounded-sm border-2 border-ink-700 bg-ink-950 px-4 py-3 text-white placeholder:text-white/30 focus:border-bolt-400 focus:outline-none"
          />
          {fieldErrors.name && (
            <p id={nameErrorId} className="mt-1 text-sm font-semibold text-red-400">
              {fieldErrors.name}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor={`${id}-email`}
            className="mb-1 block font-display text-lg tracking-wide text-bolt-400"
          >
            Email
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="alex@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? emailErrorId : undefined}
            className="w-full rounded-sm border-2 border-ink-700 bg-ink-950 px-4 py-3 text-white placeholder:text-white/30 focus:border-bolt-400 focus:outline-none"
          />
          {fieldErrors.email && (
            <p id={emailErrorId} className="mt-1 text-sm font-semibold text-red-400">
              {fieldErrors.email}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={status.kind === "submitting"}
          className="mt-1 cursor-pointer rounded-sm border-3 border-ink-950 bg-bolt-400 px-6 py-3 font-display text-2xl tracking-wider text-ink-950 text-pop-sm transition-transform hover:-translate-y-0.5 hover:bg-bolt-300 active:translate-y-0 disabled:cursor-wait disabled:opacity-60"
        >
          {status.kind === "submitting" ? "Forging…" : "Get early access →"}
        </button>
      </form>

      <div aria-live="polite" className="mt-4 min-h-6">
        {status.kind === "success" && (
          <p className="inline-block rounded-sm border-2 border-bolt-400 bg-ink-900 px-3 py-2 font-semibold text-bolt-300">
            {status.message}
          </p>
        )}
        {status.kind === "error" && (
          <p className="inline-block rounded-sm border-2 border-red-400/60 bg-ink-900 px-3 py-2 text-sm font-semibold text-red-300">
            {status.message}
          </p>
        )}
      </div>
    </div>
  );
}