import { it, expect } from "vitest";
import { runInNewContext } from "node:vm";
import { createHash, webcrypto } from "node:crypto";
// @ts-expect-error The same JavaScript generator is consumed by the Node build script.
import { workerSource } from "../../scripts/worker-source.mjs";

function harness() {
  const handlers: Record<string, (event: unknown) => void> = {};
  const stored = new Map<string, Response>();
  const requests: Request[] = [];
  const scope = "https://example.org/Maeen/app/";
  const shell = ["index.html", "assets/current.js"];
  const bodies: Record<string, string> = {
    "index.html": '<script src="assets/current.js"></script>',
    "assets/current.js": "current",
  };
  const assets = Object.fromEntries(
    Object.entries(bodies).map(([p, b]) => [
      p,
      { bytes: b.length, sha256: createHash("sha256").update(b).digest("hex") },
    ]),
  );
  const cache = {
    addAll: async (items: Request[]) => {
      requests.push(...items);
    },
    match: async (request: Request | string) =>
      stored.get(typeof request === "string" ? request : request.url),
    put: async (request: Request, response: Response) => {
      stored.set(request.url, response);
    },
  };
  const fetch = async (request: Request) => {
    requests.push(request);
    return new Response(
      bodies[new URL(request.url).pathname.replace("/Maeen/app/", "")],
    );
  };
  runInNewContext(workerSource({ shell, version: "current", assets }), {
    self: {
      registration: { scope },
      addEventListener: (name: string, fn: (e: unknown) => void) => {
        handlers[name] = fn;
      },
      clients: { claim: async () => {} },
    },
    caches: {
      open: async () => cache,
      keys: async () => [],
      delete: async () => true,
    },
    fetch,
    URL,
    Request,
    Response,
    crypto: webcrypto,
    Uint8Array,
  });
  return { handlers, stored, requests, scope };
}
it("preloads using fresh requests so stale HTTP HTML cannot mix build versions", async () => {
  const h = harness();
  let done: Promise<unknown> | undefined;
  h.handlers.install({
    waitUntil: (p: Promise<unknown>) => {
      done = p;
    },
  });
  await done;
  expect(h.requests.length).toBe(2);
  expect(h.requests.every((request) => request.cache === "reload")).toBe(true);
});
it("serves the installed shell version even when the server has a newer page", async () => {
  const h = harness();
  h.stored.set(
    `${h.scope}index.html`,
    new Response('<script src="assets/current.js"></script>'),
  );
  let result: Promise<Response> | undefined;
  h.handlers.fetch({
    request: { url: h.scope, method: "GET", mode: "navigate" },
    respondWith: (p: Promise<Response>) => {
      result = p;
    },
  });
  expect(await (await result!).text()).toContain("assets/current.js");
});
it("does not intercept another application on the same origin", () => {
  const h = harness();
  let intercepted = false;
  h.handlers.fetch({
    request: {
      url: "https://example.org/another/",
      method: "GET",
      mode: "navigate",
    },
    respondWith: () => {
      intercepted = true;
    },
  });
  expect(intercepted).toBe(false);
});
it("does not turn unknown HTML documents into the app shell", () => {
  const h = harness();
  let intercepted = false;
  h.handlers.fetch({
    request: {
      url: `${h.scope}offline-probe.html`,
      method: "GET",
      mode: "navigate",
    },
    respondWith: () => {
      intercepted = true;
    },
  });
  expect(intercepted).toBe(false);
});
