import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/index.ts"],
  tsconfig: "./tsconfig.json",
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  esbuildOptions(options) {
    options.minify = true;
    options.minifySyntax = true;
    options.minifyWhitespace = true;
    options.minifyIdentifiers = true;
  }
});