import { App, Modal, TFile } from "obsidian";

export class BrokenLinksModal extends Modal {
  brokenLinks: Map<TFile, string[]>;

  constructor(app: App, brokenLinks: Map<TFile, string[]>) {
    super(app);
    this.brokenLinks = brokenLinks;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h2", { text: "Broken File Links" });

    for (const [file, links] of this.brokenLinks) {
      const header = contentEl.createEl("h3");
      const noteLink = header.createEl("a", { text: file.basename });
      noteLink.addEventListener("click", () => {
        this.app.workspace.getLeaf().openFile(file);
        this.close();
      });

      const list = contentEl.createEl("ul");
      for (const link of links) {
        const item = list.createEl("li");
        item.createEl("span", {
          text: link,
          attr: { style: "word-break: break-all;" },
        });
      }
    }
  }

  onClose() {
    this.contentEl.empty();
  }
}
