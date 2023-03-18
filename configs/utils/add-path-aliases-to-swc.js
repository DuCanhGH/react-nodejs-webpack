/**
 * @param {any} config
 * @param {string} baseDir
 * @param {Record<string, string[]>} paths
 */
const addPathAliasesToSWC = (config, baseDir, paths) => {
  config.jsc.baseUrl = baseDir;
  config.jsc.paths = paths;
};

export default addPathAliasesToSWC;
