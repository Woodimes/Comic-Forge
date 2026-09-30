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
            className="mb-1 block font-display text-lg tracking-wide text-flash-ink"
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
            className="w-full rounded-sm border-2 border-ink bg-paper px-4 py-3 text-ink placeholder:text-ink/40 focus:border-flash focus:outline-none"
          />
          {fieldErrors.name && (
            <p id={nameErrorId} className="mt-1 text-sm font-semibold text-flash-ink">
              {fieldErrors.name}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor={`${id}-email`}
            className="mb-1 block font-display text-lg tracking-wide text-flash-ink"
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
            className="w-full rounded-sm border-2 border-ink bg-paper px-4 py-3 text-ink placeholder:text-ink/40 focus:border-flash focus:outline-none"
          />
          {fieldErrors.email && (
            <p id={emailErrorId} className="mt-1 text-sm font-semibold text-flash-ink">
              {fieldErrors.email}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={status.kind === "submitting"}
          className="btn-craft mt-1 cursor-pointer rounded-sm border-3 border-ink bg-flash px-6 py-3 font-display text-2xl tracking-wider text-paper hover:bg-flash-deep disabled:cursor-wait disabled:opacity-60"
        >
          {status.kind === "submitting" ? "Forging…" : "Get early access →"}
        </button>
      </form>

      <div aria-live="polite" className="mt-4 min-h-6">
        {status.kind === "success" && (
          <p className="inline-block rounded-sm border-2 border-flash bg-paper-2 px-3 py-2 font-semibold text-flash-ink">
            {status.message}
          </p>
        )}
        {status.kind === "error" && (
          <p className="inline-block rounded-sm border-2 border-flash/50 bg-paper-2 px-3 py-2 text-sm font-semibold text-flash-ink">
            {status.message}
          </p>
        )}
      </div>
    </div>
  );
}