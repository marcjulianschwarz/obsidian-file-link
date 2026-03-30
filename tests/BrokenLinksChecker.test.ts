import { describe, it, expect, vi, beforeEach } from "vitest";
import { findBrokenFileLinks } from "../src/BrokenLinksChecker";

vi.mock("obsidian", () => ({}));

vi.mock("fs", () => ({
  existsSync: vi.fn(),
}));

import * as fs from "fs";

const makeVault = (
  files: { basename: string; path: string; content: string }[],
) => ({
  getMarkdownFiles: () =>
    files.map(({ basename, path }) => ({ basename, path })),
  read: async (file: { path: string }) =>
    files.find((f) => f.path === file.path)?.content ?? "",
});

beforeEach(() => {
  vi.mocked(fs.existsSync).mockReset();
});

describe("findBrokenFileLinks", () => {
  it("returns empty map when no file URIs exist", async () => {
    const vault = makeVault([
      { basename: "note", path: "note.md", content: "Hello world" },
    ]);
    const result = await findBrokenFileLinks(vault as any);
    expect(result.size).toBe(0);
  });

  it("returns empty map when all linked files exist", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const vault = makeVault([
      {
        basename: "note",
        path: "note.md",
        content: "[doc](<file:///home/user/doc.odt>)",
      },
    ]);
    const result = await findBrokenFileLinks(vault as any);
    expect(result.size).toBe(0);
  });

  it("detects a broken file URI", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const vault = makeVault([
      {
        basename: "note",
        path: "note.md",
        content: "[doc](<file:///home/user/missing.odt>)",
      },
    ]);
    const result = await findBrokenFileLinks(vault as any);
    expect(result.size).toBe(1);
    const links = [...result.values()][0];
    expect(links).toContain("file:///home/user/missing.odt");
  });

  it("detects multiple broken links in the same note", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const vault = makeVault([
      {
        basename: "note",
        path: "note.md",
        content: "[a](<file:///missing1.odt>)\n[b](<file:///missing2.docx>)",
      },
    ]);
    const result = await findBrokenFileLinks(vault as any);
    const links = [...result.values()][0];
    expect(links).toHaveLength(2);
  });

  it("only reports broken links, not valid ones", async () => {
    vi.mocked(fs.existsSync).mockImplementation(
      (p) => p === "/home/user/exists.odt",
    );
    const vault = makeVault([
      {
        basename: "note",
        path: "note.md",
        content:
          "[a](<file:///home/user/exists.odt>) [b](<file:///home/user/missing.odt>)",
      },
    ]);
    const result = await findBrokenFileLinks(vault as any);
    const links = [...result.values()][0];
    expect(links).toHaveLength(1);
    expect(links[0]).toContain("missing.odt");
  });

  it("handles broken links across multiple notes", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const vault = makeVault([
      {
        basename: "note1",
        path: "note1.md",
        content: "[a](<file:///missing1.odt>)",
      },
      {
        basename: "note2",
        path: "note2.md",
        content: "[b](<file:///missing2.odt>)",
      },
    ]);
    const result = await findBrokenFileLinks(vault as any);
    expect(result.size).toBe(2);
  });

  it("handles percent-encoded paths", async () => {
    vi.mocked(fs.existsSync).mockImplementation(
      (p) => String(p) === "/home/user/my file.odt",
    );
    const vault = makeVault([
      {
        basename: "note",
        path: "note.md",
        content: "[a](<file:///home/user/my%20file.odt>)",
      },
    ]);
    const result = await findBrokenFileLinks(vault as any);
    expect(result.size).toBe(0);
  });
});
