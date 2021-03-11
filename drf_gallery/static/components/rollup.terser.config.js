import { terser } from "https://deno.land/x/drollup@2.41.0+0.16.1/plugins/terser/mod.ts";

export default {
/*
  input: "./src/mod.ts",
  output: {
    dir: "./dist",
    format: "es" as const,
  },
*/
  plugins: [terser()],
};
