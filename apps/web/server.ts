import { resolve } from "node:path";

// Only files in the build's public output can be served as static assets.
const clientDirectory = resolve(import.meta.dir, "dist/client");
const staticFiles = new Map<string, string>();
for await (const file of new Bun.Glob("**/*").scan({
  cwd: clientDirectory,
  onlyFiles: true,
})) {
  staticFiles.set(`/${file}`, resolve(clientDirectory, file));
}
const entryPath = resolve(import.meta.dir, "dist/server/server.js");
const { default: application } = await import(entryPath);
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const server = Bun.serve({
  hostname: process.env.HOST ?? "0.0.0.0",
  port,
  async fetch(request) {
    const pathname = new URL(request.url).pathname;
    if (pathname === "/healthz") {
      return new Response(request.method === "HEAD" ? null : "ok", {
        headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
      });
    }
    const staticPath = staticFiles.get(pathname);
    if (staticPath && (request.method === "GET" || request.method === "HEAD")) {
      const file = Bun.file(staticPath);
      return new Response(request.method === "HEAD" ? null : file, {
        headers: {
          "Content-Type": file.type,
          "Content-Length": String(file.size),
          "Cache-Control": pathname.startsWith("/assets/")
            ? "public, max-age=31536000, immutable"
            : "public, max-age=3600",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    if (pathname.startsWith("/assets/"))
      return new Response("Not found", { status: 404 });
    return application.fetch(request);
  },
  error(error) {
    console.error("Production request failed:", error.message);
    return new Response("Internal server error", { status: 500 });
  },
});
console.log(`SkyCanvas Studio listening on ${server.hostname}:${server.port}`);
for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.once(signal, () => {
    void server.stop().then(() => process.exit(0));
  });
}
