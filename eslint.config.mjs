import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Written by `convex dev` / `convex codegen`.
    "convex/_generated/**",
    // Written by `astryx theme build` from src/theme/n3wthTheme.ts.
    "src/theme/n3wth.js",
    "src/theme/n3wth.d.ts",
  ]),
]);

export default eslintConfig;
