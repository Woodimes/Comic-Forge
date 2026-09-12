// Temporary verification server: serves the BUILT site (dist/) on a private
// port so we can exercise server functions against the live DB without
// touching the platform's port-3000 servers. Deleted after verification.
import handler from "./dist/server/server.js";

const PORT = 3210;
const HOST = "127.0.0.1";
const CLIENT_DIR = `${import.meta.dir}/dist/client`;

Bun.serve({
  port: PORT,
  hostname: HOST,
  async fetch(req) {
    const { pathname } = new URL(req.url);
    if (pathname !== "/" && pathname !== "/index.html") {
      const file = Bun.file(CLIENT_DIR + pathname);
      if (await file.exists()) return new Response(file);
    }
    return (handler as { fetch: (r: Request) => Response | Promise<Response> }).fetch(req);
  },
});
console.log(`TEST-SERVER http://${HOST}:${PORT}`);