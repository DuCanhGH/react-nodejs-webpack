import { merge } from "webpack-merge";

/**
 * @param {...(import("webpack").Configuration | import("../types").WebpackConfigFunction)} configs
 * @returns {import("../types").WebpackConfigFunction}
 */
export const callAndMergeConfigs = (...configs) => {
  return async (env, argv) => {
    /** @type {import("webpack").Configuration} */
    let finalConfig = {};
    for (const i of configs) {
      if (!i) {
        continue;
      }
      if (typeof i === "function") {
        const calledI = await i(env, argv);
        if (!calledI) {
          continue;
        }
        finalConfig = merge(finalConfig, calledI);
        continue;
      }
      finalConfig = merge(finalConfig, i);
    }
    return finalConfig;
  };
};
