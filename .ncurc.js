// @ts-check
/** @type {import("npm-check-updates").RunOptions} */
module.exports = {
  target: (dependencyName) => {
    if (dependencyName === "typescript") {
      return "@next";
    }
    if (/^react(-dom)?$/.test(dependencyName)) {
      return "@experimental";
    }
    return "latest";
  },
};
