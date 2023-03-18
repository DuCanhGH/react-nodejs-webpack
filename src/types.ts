export interface PagesManifest {
  path: string;
  importPath: string;
  children: PagesManifest[];
}

export type AssetsManifest = Record<string, Record<string, string[]>>;
