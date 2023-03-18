import fs from "fs-extra";

/**
 * @param {import("fs-extra").PathLike} source
 * @returns
 */
const getDirectories = async (source) =>
  (await fs.readdir(source, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

export { getDirectories };
