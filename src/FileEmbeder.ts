import * as fs from "fs";
import * as path from "path";
import { FileLinkSettings, PathInfo } from "./interfaces";
import { SUPPORTED_EMBED_FILE_TYPES } from "./constants";
import { Notice } from "obsidian";

export class FileEmbeder {
  settings: FileLinkSettings;

  constructor(settings: FileLinkSettings) {
    this.settings = settings;
  }

  getEmbedMarkdownLink(filePath: string) {
    const { ext } = this.getPathInformation(filePath);
    console.log(ext);
    if (!SUPPORTED_EMBED_FILE_TYPES.includes(ext)) {
      new Notice(
        `Files of this type are not supported for embedding in Obsidian.`
      );
    }
    return "!" + this.getMarkdownLink(filePath, false);
  }

  copyFile(sourcePath: string, targetDir: string) {
    try {
      fs.mkdirSync(targetDir, { recursive: true });

      const filename = path.basename(sourcePath);
      const destPath = path.join(targetDir, filename);

      fs.copyFileSync(sourcePath, destPath);
      return destPath;
    } catch (err) {
      console.error("Copy failed:", err);
      throw new Error(`File copy failed: ${err.message}`);
    }
  }

  getPathInformation(filePath: string): PathInfo {
    const normalizedPath = path.normalize(filePath);
    const parsedPath = path.parse(normalizedPath);

    return {
      fullPath: normalizedPath,
      dir: parsedPath.dir,
      filename: parsedPath.base,
      name: parsedPath.name,
      ext: parsedPath.ext,
    };
  }

  getMarkdownLink(filePath: string, printPrefix: boolean): string {
    const pathInfo = this.getPathInformation(filePath);
    const prefix = printPrefix ? this.settings.linkPrefix : "";
    let linkText = pathInfo.name;
    if (this.settings.linkFolder) {
      linkText = pathInfo.dir;
    }
    if (this.settings.showFileEnding) {
      linkText = pathInfo.filename;
    }

    const linkPath = this.settings.linkFolder
      ? pathInfo.dir
      : pathInfo.fullPath;

    return this.formatMarkdownLink(prefix, linkText, linkPath);
  }

  private formatMarkdownLink(
    prefix: string,
    text: string,
    path: string
  ): string {
    return `${prefix} [${text}](<file:///${path}>)\n`;
  }
}
