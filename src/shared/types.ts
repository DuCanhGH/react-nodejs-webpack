import type { FILE_TYPES } from "../../configs/shared/constants";

export interface PagesManifest {
  path: string;
  importPaths: Partial<Record<(typeof FILE_TYPES)[number], string>>;
  children: PagesManifest[];
}

export type AssetsManifest = Record<string, Record<string, string[]>>;
