import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "ComicForge — From idea to publish-ready comic, all in one forge",
      },
      {
        name: "description",
        content:
          "ComicForge is the all-in-one workspace where creators take a comic idea from story and script to panels, art, lettering, and publish-ready export.",
      },
      { name: "theme-color", content: "#090b14" },
      { property: "og:title", content: "ComicForge — From idea to publish-ready comic" },
      {
        property: "og:description",
        content:
          "Story, script, panels, art, lettering, export — one workspace for creators. Get early access.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:image",
        content: "https://9d52847b5f78702959f5f20e8f39025f.ctonew.app/og.png",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/png" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "ComicForge — From idea to publish-ready comic",
      },
      {
        name: "twitter:description",
        content:
          "Story, script, panels, art, lettering, export — one workspace for creators. Get early access.",
      },
      {
        name: "twitter:image",
        content: "https://9d52847b5f78702959f5f20e8f39025f.ctonew.app/og.png",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bangers&family=Inter:wght@400;500;600;700;800&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  notFoundComponent: () => <div>Page not found</div>,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}