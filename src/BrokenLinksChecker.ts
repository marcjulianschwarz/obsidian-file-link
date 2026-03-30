import * as fs from "fs";
import { Vault, TFile } from "obsidian";

const FILE_URI_REGEX = /file:\/\/[^\s)>"]+/g;

export async function findBrokenFileLinks(
  vault: Vault,
): Promise<Map<TFile, string[]>> {
  const results = new Map<TFile, string[]>();

  const files = vault.getMarkdownFiles();

  for (const file of files) {
    const content = await vault.read(file);
    const broken: string[] = [];

    let match;
    FILE_URI_REGEX.lastIndex = 0;
    while ((match = FILE_URI_REGEX.exec(content)) !== null) {
      const uri = match[0];
      const filePath = decodeURIComponent(new URL(uri).pathname);
      if (!fs.existsSync(filePath)) {
        broken.push(uri);
      }
    }

    if (broken.length > 0) {
      results.set(file, broken);
    }
  }

  return results;
}
