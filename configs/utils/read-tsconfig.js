import path from "path";
import ts from "typescript";

import { rootDir } from "../shared/constants.js";

const readTSConfig = () => {
  // Find tsconfig.json file
  const tsConfigPath =
    ts.findConfigFile(rootDir, ts.sys.fileExists, "tsconfig.json") ??
    ts.findConfigFile(rootDir, ts.sys.fileExists, "jsconfig.json");

  if (!tsConfigPath) {
    return;
  }

  // Read tsconfig.json file
  const tsConfigFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);

  // Resolve extends
  const parsedTSConfig = ts.parseJsonConfigFileContent(
    tsConfigFile.config,
    ts.sys,
    path.dirname(tsConfigPath),
  );

  return parsedTSConfig;
};

export default readTSConfig;
