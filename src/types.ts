export interface PagesManifest {
  path: string;
  children: PagesManifest[];
}

export type AssetsManifest = Record<string, Record<string, string[]>>;
