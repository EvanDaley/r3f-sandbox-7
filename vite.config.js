import { defineConfig } from "vite";
import * as path from "node:path";
import react from "@vitejs/plugin-react";

const isCodeSandbox =
  "SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env;

const dev = defineConfig({
  plugins: [react()],
  root: "example/",
  publicDir: "../public/",
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    open: !isCodeSandbox, // Open if it's not a CodeSandbox
  },
});

const exampleBuild = defineConfig({
  plugins: [react()],
  root: "example/",
  publicDir: "../public/",
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../dist-example",
    emptyOutDir: true,
  },
});

const build = defineConfig({
  publicDir: false,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: false,
    sourcemap: true,
    target: "es2018",
    lib: {
      formats: ["cjs", "es"],
      entry: "src/Ecctrl.tsx",
      fileName: "[name]",
    },
    rollupOptions: {
      external: (id) => !id.startsWith(".") && !path.isAbsolute(id) && !id.startsWith("@/"),
      output: {
        sourcemapExcludeSources: true,
      },
    },
  },
});

// Command line args:
// - "vite build" -> library build
// - BUILD_TARGET=example vite build -> example build for GitHub Pages
// - "vite" -> dev server
// Check for BUILD_TARGET env var
const buildTarget = process.env.BUILD_TARGET;
export default buildTarget === "example"
  ? exampleBuild
  : process.argv[2] === "build"
  ? build
  : dev;
