export interface FileLinkSettings {
  linkPrefix: string;
  showFileEnding: boolean;
  linkFolder: boolean;
  embedFile: boolean;
}

export interface PathInfo {
  fullPath: string;
  dir: string;
  filename: string;
  name: string;
  ext: string;
}
