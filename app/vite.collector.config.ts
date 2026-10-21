import { defineConfig } from "vite";
export default defineConfig({
  base: "./",
  build: {
    outDir: "collector-dist",
    rollupOptions: { input: "collector.html" },
  },
});
