import { describe, it, expect, vi } from "vitest";
import { FileEmbeder } from "../src/FileEmbeder";
import { DEFAULT_SETTINGS } from "../src/constants";

vi.mock("obsidian", () => ({
  Notice: vi.fn(),
}));

const defaultEmbeder = () => new FileEmbeder({ ...DEFAULT_SETTINGS });

describe("getPathInformation", () => {
  it("parses a standard file path", () => {
    const info = defaultEmbeder().getPathInformation(
      "/home/user/docs/report.pdf",
    );
    expect(info.filename).toBe("report.pdf");
    expect(info.name).toBe("report");
    expect(info.ext).toBe(".pdf");
    expect(info.dir).toBe("/home/user/docs");
  });

  it("handles a file with no extension", () => {
    const info = defaultEmbeder().getPathInformation("/home/user/README");
    expect(info.filename).toBe("README");
    expect(info.name).toBe("README");
    expect(info.ext).toBe("");
  });
});

describe("getMarkdownLink", () => {
  it("uses filename without extension by default", () => {
    const link = defaultEmbeder().getMarkdownLink(
      "/home/user/docs/report.pdf",
      false,
    );
    expect(link).toBe("[report](<file:////home/user/docs/report.pdf>)\n");
  });

  it("includes extension when showFileEnding is true", () => {
    const embeder = new FileEmbeder({
      ...DEFAULT_SETTINGS,
      showFileEnding: true,
    });
    const link = embeder.getMarkdownLink("/home/user/docs/report.pdf", false);
    expect(link).toBe("[report.pdf](<file:////home/user/docs/report.pdf>)\n");
  });

  it("links to folder when linkFolder is true", () => {
    const embeder = new FileEmbeder({ ...DEFAULT_SETTINGS, linkFolder: true });
    const link = embeder.getMarkdownLink("/home/user/docs/report.pdf", false);
    expect(link).toBe("[/home/user/docs](<file:////home/user/docs>)\n");
  });

  it("prepends prefix when printPrefix is true", () => {
    const embeder = new FileEmbeder({ ...DEFAULT_SETTINGS, linkPrefix: "-" });
    const link = embeder.getMarkdownLink("/home/user/docs/report.pdf", true);
    expect(link).toBe("- [report](<file:////home/user/docs/report.pdf>)\n");
  });

  it("does not prepend prefix when printPrefix is false", () => {
    const embeder = new FileEmbeder({ ...DEFAULT_SETTINGS, linkPrefix: "-" });
    const link = embeder.getMarkdownLink("/home/user/docs/report.pdf", false);
    expect(link).toBe("[report](<file:////home/user/docs/report.pdf>)\n");
  });
});

describe("getEmbedMarkdownLink", () => {
  it("prepends ! for supported embed types", () => {
    const link = defaultEmbeder().getEmbedMarkdownLink("/home/user/image.png");
    expect(link).toBe("![image](<file:////home/user/image.png>)\n");
  });

  it("still returns a link for unsupported embed types", () => {
    const link = defaultEmbeder().getEmbedMarkdownLink(
      "/home/user/archive.zip",
    );
    expect(link).toBe("![archive](<file:////home/user/archive.zip>)\n");
  });
});
