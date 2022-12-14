import type { Configuration } from "webpack";

export type Argv = Record<string, any> & {
  mode: "production" | "development" | "none";
};

export type WebpackConfigFunction = (
  env: Record<string, any>,
  argv: Argv,
) => Configuration | Promise<Configuration>;
