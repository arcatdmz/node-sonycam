import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json";

export default [
  {
    input: "lib/index.ts",
    output: {
      file: pkg.module,
      format: "es",
    },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [typescript({ tsconfig: "./tsconfig.json" })],
  },
];
