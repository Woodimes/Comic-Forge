import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import site from "../../site.json";
import { WaitlistForm } from "~/components/WaitlistForm";

export const Route = createFileRoute("/")({
  component: Home,
});

const BUSINESS = site.businessName || "ComicForge";

const WORKFLOW = [
  { step: "Story", desc: "Premise, characters, and plot — shaped in one place." },
  { step: "Script", desc: "Write pages, panels, and dialogue as a living script." },
  { step: "Panels", desc: "Block layouts and pacing before a single line is drawn." },
  { step: "Art", desc: "Pencils, inks, flats, and colors — organized by page." },
  { step: "Lettering", desc: "Bubbles, SFX, and captions that read clean." },
  { step: "Export", desc: "Publish-ready files, print and digital, from one click." },
];

const FEATURES = [
  {
    title: "One workspace, whole pipeline",
    desc: "Story to export in a single project. Every stage of your comic lives in one place instead of ten tabs.",
  },
  {
    title: "No more tool-hopping",
    desc: "Scripts, layout boards, art notes, and lettering pass files to each other — so you don't have to babysit the handoff.",
  },
  {
    title: "Creator-first",
    desc: "We're building workflows and pricing around independent creators first — solo artists and small teams, not corporate pipelines.",
  },
  {
    title: "Export-ready files",
    desc: "A publish pipeline that packages final pages for print and digital is at the top of our roadmap. 'Publish' should be a button, not a saga.",
  },
  {
    title: "Your story, your rights",
    desc: "You own everything you make in ComicForge. The tool works for you — it never locks up your work or your IP.",
  },
  {
    title: "Built out loud with creators",
    desc: "We're building in the open with early-access creators, so the roadmap follows what actually helps you make comics.",
  },
];

const AUDIENCE = [
  {
    title: "Webcomic artists",
    desc: "Stop juggling docs, folders, and image apps. Keep your whole series organized in one forge.",
  },
  {
    title: "YouTubers & streamers",
    desc: "Turn channel lore, skits, and fan stories into comic pages your community can hold.",
  },
  {
    title: "Game devs & studios",
    desc: "Character bibles, visual scripts, and pitch decks — comics that ship alongside your world.",
  },
  {
    title: "Writers & storytellers",
    desc: "If you dream in panels, you're a comic creator. ComicForge is where that starts.",
  },
];

const CTA_PRIMARY =
  "btn-craft rounded-sm bg-flash px-6 py-3 font-display text-2xl tracking-wider text-paper";

function SectionHeading({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: ReactNode;
  sub?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="font-display text-lg tracking-[0.3em] text-flash-ink">{kicker}</p>
      <h2 className="mt-3 font-display text-5xl leading-[0.95] tracking-wide text-ink text-pop sm:text-6xl">
        {title}
      </h2>
      {sub && <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft">{sub}</p>}
    </div>
  );
}

function Burst({ label, className }: { label: ReactNode; className?: string }) {
  return (
    <div className={`relative ${className ?? ""}`} aria-hidden="true">
      <div className="absolute inset-0 rounded-sm bg-ink p-[6px]">
        <div className="burst h-full w-full bg-flash" />
      </div>
      <div className="relative z-10 flex h-full w-full items-center justify-center p-4 text-center">
        <span className="font-display text-2xl tracking-wide text-paper sm:text-3xl">{label}</span>
      </div>
    </div>
  );
}

function Home() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-paper font-sans text-ink">
      <a
        href="#signup"
        className="sr-only z-50 rounded-sm border-2 border-ink bg-flash px-4 py-2 font-semibold text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to sign up
      </a>

      {/* ---------- Header ---------- */}
      <header className="relative z-30 border-b-3 border-ink bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a href="#" className="flex items-baseline gap-2">
            <span className="font-display text-3xl tracking-wide text-ink text-pop-sm">
              {BUSINESS}
            </span>
            <span className="hidden rounded-sm border-2 border-ink px-1.5 py-0.5 font-display text-xs tracking-widest text-ink/60 sm:inline-block">
              ISSUE #0
            </span>
          </a>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/script-forge"
              className="btn-craft-sm rounded-sm bg-flash px-4 py-2 font-display text-lg tracking-wider text-paper"
            >
              Forge a script →
            </Link>
            <a
              href="#signup"
              className="rounded-sm border-2 border-ink/30 px-3 py-1.5 font-display text-sm tracking-widest text-ink/70 transition-colors hover:border-ink hover:bg-paper-3 hover:text-ink"
            >
              EARLY ACCESS
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* ---------- Hero ---------- */}
        <section className="relative overflow-hidden">
          <div className="halftone pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
          <div
            id="signup"
            className="relative mx-auto grid max-w-6xl scroll-mt-24 items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-20"
          >
            <div>
              <p className="inline-block -rotate-1 rounded-sm bg-flash px-3 py-1 font-display text-sm tracking-[0.25em] text-paper">
                EARLY ACCESS — OPENING SOON
              </p>
              <h1 className="mt-6 font-display text-6xl leading-[0.9] tracking-wide text-ink text-pop sm:text-7xl lg:text-8xl">
                FROM IDEA TO <span className="text-flash">PUBLISH-READY</span> COMIC, ALL IN ONE{" "}
                <span className="text-outline">FORGE</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-ink-soft sm:text-xl">
                {BUSINESS} is the all-in-one workspace where creators develop
                stories, script pages, lay out panels, produce art, letter, and
                export comics that are ready to publish — no more stitching ten
                tools together.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link to="/script-forge" className={CTA_PRIMARY}>
                  Forge a script now →
                </Link>
                <span className="max-w-[15rem] font-display text-sm leading-tight tracking-wide text-ink/60">
                  LIVE NOW — DRAFT A 4–8 PAGE SCRIPT FROM YOUR IDEA, FREE, NO SIGN-UP
                </span>
              </div>

              <p className="mt-5 text-sm text-ink/70">
                Already forged one?{" "}
                <Link
                  to="/panel-layout"
                  className="font-semibold text-process underline decoration-process/40 decoration-2 underline-offset-2 transition-colors hover:decoration-process"
                >
                  Open Panel Layout
                </Link>{" "}
                and block out the pages — also free, also no sign-up.
              </p>

              <div className="panel mt-12 max-w-xl rounded-sm p-6 sm:p-7">
                <span className="absolute -top-4 left-4 rotate-[-2deg] rounded-sm bg-ink px-2 py-0.5 font-display text-sm tracking-widest text-paper">
                  OR GET EARLY ACCESS
                </span>
                <h2 className="mb-4 mt-2 font-display text-3xl tracking-wide text-ink">
                  Join the early-access list
                </h2>
                <WaitlistForm id="hero" />
                <p className="mt-3 text-sm text-ink/60">
                  No spam, no noise — just an invite when the forge opens.
                </p>
              </div>
            </div>

            {/* Cover mock — hand-built, no images */}
            <div className="relative hidden lg:block" aria-hidden="true">
              <div className="relative mx-auto w-[340px] rotate-2">
                <div className="panel overflow-hidden rounded-sm">
                  <div className="halftone-flash absolute inset-0 opacity-70" />
                  <div className="relative flex aspect-[4/5] flex-col items-center justify-between p-4">
                    <div className="z-10 flex w-full items-start justify-between">
                      <span className="font-display text-lg tracking-widest text-ink text-pop-sm">
                        {BUSINESS}
                      </span>
                      <span className="rounded-sm border-2 border-ink bg-bolt-400 px-1.5 font-display text-lg leading-tight text-ink">
                        #0
                      </span>
                    </div>

                    <Burst label="NEW!" className="h-36 w-36" />

                    <div className="z-10 w-full space-y-2">
                      <p className="text-center font-display text-3xl leading-none tracking-wide text-ink text-pop">
                        YOUR NEXT COMIC
                      </p>
                      <div className="hatch rounded-sm border-2 border-ink bg-paper-3 px-3 py-2 text-center font-display text-sm tracking-[0.2em] text-ink">
                        STORY → PANELS → ART → LETTERING → EXPORT
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-6 -top-6 -rotate-6 rounded-sm border-3 border-ink bg-paper px-2 py-1 font-display text-xl text-ink">
                  ★ KRAK!
                </div>
                <div className="absolute -bottom-5 -left-6 rotate-3 rounded-sm border-3 border-ink bg-flash px-3 py-1.5 font-display text-base tracking-wider text-paper">
                  SOON IN YOUR HANDS
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Workflow strip ---------- */}
        <section className="relative border-y-3 border-ink bg-paper-2">
          <div className="halftone-ink pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <SectionHeading
              kicker="THE PIPELINE"
              title={<>FROM IDEA TO PRINTED PAGE</>}
              sub="One continuous pipeline, from the first spark to the final file."
            />
            <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {WORKFLOW.map((w, i) => (
                <li key={w.step} className="relative">
                  {w.step === "Script" ? (
                    <Link to="/script-forge" className="block h-full">
                      <div className="panel h-full rounded-sm p-5 transition-transform hover:-translate-y-1">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border-2 border-ink bg-paper-3 font-display text-xl text-ink">
                            {i + 1}
                          </span>
                          <h3 className="font-display text-3xl tracking-wide text-ink text-pop-sm">
                            {w.step}
                          </h3>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{w.desc}</p>
                        <p className="mt-4 inline-block rounded-sm bg-flash px-2 py-0.5 font-display text-xs tracking-widest text-paper">
                          LIVE NOW — TRY IT
                        </p>
                        {i < WORKFLOW.length - 1 && (
                          <span
                            className="flow-arrow absolute -right-5 top-1/2 hidden -translate-y-1/2 lg:block"
                            aria-hidden="true"
                          >
                            →
                          </span>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="panel h-full rounded-sm p-5 transition-transform hover:-translate-y-1">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border-2 border-ink bg-paper-3 font-display text-xl text-ink">
                          {i + 1}
                        </span>
                        <h3 className="font-display text-3xl tracking-wide text-ink text-pop-sm">
                          {w.step}
                        </h3>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{w.desc}</p>
                      {i < WORKFLOW.length - 1 && (
                        <span
                          className="flow-arrow absolute -right-5 top-1/2 hidden -translate-y-1/2 lg:block"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Features ---------- */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <SectionHeading
              kicker="WHAT'S IN THE FORGE"
              title={<>EVERYTHING YOUR COMIC NEEDS</>}
              sub={`${BUSINESS} is in early development. This is our working roadmap — features earn their way in as we build, and early-access creators help shape what ships first.`}
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <article key={f.title} className="panel-process rounded-sm p-6">
                  <span className="block h-1.5 w-12 bg-flash" aria-hidden="true" />
                  <h3 className="mt-4 font-display text-2xl tracking-wide text-ink text-pop-sm">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Audience ---------- */}
        <section className="relative border-y-3 border-ink bg-paper-2">
          <div className="halftone-ink pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <SectionHeading
              kicker="MADE FOR STORYTELLERS"
              title={<>FOR EVERYONE WHO TELLS STORIES IN PANELS</>}
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {AUDIENCE.map((a) => (
                <article key={a.title} className="panel rounded-sm p-6">
                  <h3 className="font-display text-2xl tracking-wide text-flash-ink text-pop-sm">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{a.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Final CTA ---------- */}
        <section className="relative overflow-hidden">
          <div className="halftone pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
          <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
            <div className="pop-in relative mb-10 flex justify-center">
              <Burst label="YOUR TURN!" className="h-40 w-40" />
            </div>
            <h2 className="text-center font-display text-5xl leading-[0.95] tracking-wide text-ink text-pop sm:text-6xl">
              THE FORGE IS <span className="text-flash">WARMING UP</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-center text-lg text-ink-soft">
              Get early access to {BUSINESS}. Be first in when we open the doors —
              and help shape what gets built.
            </p>
            <div
              id="signup-final"
              className="panel-flash mx-auto mt-12 max-w-xl scroll-mt-24 rounded-sm p-6 sm:p-7"
            >
              <h3 className="mb-4 font-display text-3xl tracking-wide text-ink">
                Join the early-access list
              </h3>
              <WaitlistForm id="final" />
            </div>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="border-t-3 border-ink bg-paper-2">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
          <p className="font-display text-2xl tracking-wide text-ink">{BUSINESS}</p>
          <p className="text-sm text-ink/70">
            © {new Date().getFullYear()} {BUSINESS}. Made by creators, for creators.
          </p>
        </div>
      </footer>
    </div>
  );
}
