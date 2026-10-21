// Local test-only /Maeen/ hosting and controlled SW update simulation. Never deployed.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
let generation = 0,
  offline = false;
const requests = new Map();
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1");
      if (url.pathname === "/__phase6/reset") {
        requests.clear();
        res.end("reset");
        return;
      }
      if (url.pathname === "/__phase6/stats") {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(Object.fromEntries(requests)));
        return;
      }
      if (url.pathname === "/__phase6/update" && req.method === "POST") {
        generation++;
        res.end("updated");
        return;
      }
      if (url.pathname === "/__phase6/offline" && req.method === "POST") {
        offline = true;
        res.end("offline");
        return;
      }
      if (url.pathname === "/__phase6/online" && req.method === "POST") {
        offline = false;
        res.end("online");
        return;
      }
      if (url.pathname.startsWith("/Maeen/"))
        requests.set(url.pathname, (requests.get(url.pathname) || 0) + 1);
      if (offline) {
        req.socket.destroy();
        return;
      }
      if (url.pathname === "/Maeen") {
        res.writeHead(302, { location: "/Maeen/" });
        res.end();
        return;
      }
      if (!url.pathname.startsWith("/Maeen/")) {
        res.writeHead(404);
        res.end();
        return;
      }
      const relative =
          decodeURIComponent(url.pathname.slice("/Maeen/".length)) ||
          "index.html",
        file = path.resolve(root, relative);
      if (
        !file.startsWith(root + path.sep) &&
        file !== path.join(root, "index.html")
      ) {
        res.writeHead(403);
        res.end();
        return;
      }
      if (!(await stat(file)).isFile()) throw Error("not file");
      let bytes = await readFile(file);
      if (relative === "sw.js" && generation)
        bytes = Buffer.from(
          bytes
            .toString()
            .replace(/shell-([a-f0-9]{16})/, `shell-$1-test${generation}`) +
            "\n// local update " +
            generation,
        );
      const type =
        {
          ".html": "text/html",
          ".js": "text/javascript",
          ".css": "text/css",
          ".wasm": "application/wasm",
          ".json": "application/json",
          ".webmanifest": "application/manifest+json",
          ".svg": "image/svg+xml",
          ".png": "image/png",
        }[path.extname(file)] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
      res.end(bytes);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  })
  .listen(4200, "127.0.0.1", () =>
    console.log("Local PWA verification: http://127.0.0.1:4200/Maeen/"),
  );
