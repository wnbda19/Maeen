import { it, expect, vi } from "vitest";
import { runInNewContext } from "node:vm";
import { createHash, webcrypto } from "node:crypto";
// @ts-expect-error shared build generator
import { workerSource } from "../../scripts/worker-source.mjs";
function fixture(model = "one") {
  const scope = "https://example.org/Maeen/",
    handlers: any = {},
    stores = new Map<string, Map<string, Response>>(),
    calls: Request[] = [];
  const bodies: Record<string, string> = {
    "index.html": "shell",
    "assets/main.js": "main",
    "models/test.bin": model,
  };
  const hashes = Object.fromEntries(
    Object.entries(bodies).map(([p, b]) => [
      p,
      { sha256: createHash("sha256").update(b).digest("hex"), bytes: b.length },
    ]),
  );
  let online = true;
  const skip = vi.fn();
  runInNewContext(
    workerSource({
      shell: ["index.html", "assets/main.js"],
      version: "new",
      assets: hashes,
    }),
    {
      self: {
        registration: { scope },
        clients: { claim: async () => {} },
        skipWaiting: skip,
        addEventListener: (k: string, f: any) => (handlers[k] = f),
      },
      caches: {
        open: async (name: string) => {
          if (!stores.has(name)) stores.set(name, new Map());
          const s = stores.get(name)!;
          return {
            match: async (r: any) =>
              s.get(typeof r === "string" ? r : r.url)?.clone(),
            put: async (r: any, v: Response) => {
              s.set(typeof r === "string" ? r : r.url, v.clone());
            },
            delete: async (r: any) =>
              s.delete(typeof r === "string" ? r : r.url),
            keys: async () => [...s.keys()].map((u) => new Request(u)),
          };
        },
        keys: async () => [...stores.keys()],
        delete: async (k: string) => stores.delete(k),
      },
      fetch: async (r: Request) => {
        calls.push(r);
        if (!online) throw Error("offline");
        const p = new URL(r.url).pathname.replace("/Maeen/", "");
        return new Response(bodies[p] ?? "missing", {
          status: p in bodies ? 200 : 404,
        });
      },
      crypto: webcrypto,
      URL,
      Request,
      Response,
      Uint8Array,
      Set,
      Map,
    },
  );
  const get = async (path: string, mode = "cors", method = "GET") => {
    let response: any;
    handlers.fetch({
      request: new Request(scope + path, { method }),
      get mode() {
        return mode;
      },
      respondWith: (p: any) => (response = p),
    });
    return response;
  };
  return {
    handlers,
    stores,
    calls,
    skip,
    bodies,
    scope,
    get,
    offline: () => (online = false),
  };
}
it("serves a verified cached model offline without redownloading", async () => {
  const h = fixture();
  expect(await (await h.get("models/test.bin")).text()).toBe("one");
  h.offline();
  expect(await (await h.get("models/test.bin")).text()).toBe("one");
  expect(h.calls).toHaveLength(1);
});
it("rejects a corrupt cached model offline rather than returning stale bytes", async () => {
  const h = fixture();
  await h.get("models/test.bin");
  const cache = [...h.stores.values()][0],
    key = [...cache.keys()][0];
  cache.set(key, new Response("corrupt"));
  h.offline();
  const r = await h.get("models/test.bin");
  expect(r.status).toBe(503);
  expect(r.headers.get("X-MAEEN-Cache-Error")).toBeTruthy();
});
it("rejects a server model whose digest differs from the catalog", async () => {
  const h = fixture();
  h.bodies["models/test.bin"] = "different";
  expect((await h.get("models/test.bin")).status).toBe(502);
});
it("versioned cache keys incorporate exact model hashes", async () => {
  const a = fixture("one"),
    b = fixture("two");
  await a.get("models/test.bin");
  await b.get("models/test.bin");
  expect([...a.stores.values()][0].keys().next().value).not.toBe(
    [...b.stores.values()][0].keys().next().value,
  );
});
it("does not intercept private records or POST requests", async () => {
  const h = fixture();
  expect(await h.get("collection/private/clip.webm")).toBeUndefined();
  expect(await h.get("models/test.bin", "cors", "POST")).toBeUndefined();
});
it("does not auto-activate a waiting update; accepts only a scoped client action", () => {
  const h = fixture();
  expect(h.skip).not.toHaveBeenCalled();
  h.handlers.message({
    data: { type: "ACTIVATE_UPDATE" },
    source: { url: "https://example.org/other/" },
  });
  expect(h.skip).not.toHaveBeenCalled();
  h.handlers.message({
    data: { type: "ACTIVATE_UPDATE" },
    source: { url: h.scope },
  });
  expect(h.skip).toHaveBeenCalledOnce();
});
