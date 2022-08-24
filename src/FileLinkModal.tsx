import { Modal, App, Notice, MarkdownView, TFile } from "obsidian";
import FileLink from "../main";
import { FileEmbeder } from "./FileEmbeder";

export class FileLinkModal extends Modal {
  plugin: FileLink;

  constructor(app: App, plugin: FileLink) {
    super(app);
    this.plugin = plugin;
  }

  onOpen() {
    let { contentEl } = this;
    contentEl.createEl("h2", { text: "Select files:" });
    let input = contentEl.createEl("input", {
      type: "file",
      attr: { multiple: "" },
    });
    contentEl.createEl("br");
    contentEl.createEl("br");

    let checkboxEmbed = contentEl.createEl("input", {
      type: "checkbox",
      attr: { id: "embed" },
    });
    contentEl.createEl("label", { text: "Embed file", attr: { for: "embed" } });
    contentEl.createEl("br");
    let checkboxFileFolder = contentEl.createEl("input", {
      type: "checkbox",
      attr: { id: "file-folder" },
    });
    contentEl.createEl("label", {
      text: "Link folder",
      attr: { for: "file-folder" },
    });
    contentEl.createEl("br");
    let checkboxFileEnding = contentEl.createEl("input", {
      type: "checkbox",
      attr: { id: "file-ending" },
    });
    contentEl.createEl("label", {
      text: "Show file extension",
      attr: { for: "file-ending" },
    });
    contentEl.createEl("br");
    contentEl.createEl("br");
    contentEl.createEl("br");
    let button = contentEl.createEl("button", { text: "Add file link" });

    button.addEventListener("click", () => {
      let embedFile = checkboxEmbed.checked;
      let fileList = input.files;
      if (fileList) {
        let files = Array.from(fileList);
        this.plugin.settings.linkFolder = checkboxFileFolder.checked;
        this.plugin.settings.showFileEnding = checkboxFileEnding.checked;

        //@ts-ignore
        let attachementFolder = this.app.vault.config.attachmentFolderPath;
        //@ts-ignore
        let basePath = this.app.vault.adapter.basePath;

        let fe = new FileEmbeder(
          attachementFolder,
          basePath,
          this.plugin.settings
        );

        if (embedFile) {
          files.forEach((file: File) => {
            fe.embedFile(file);
            let embedLinkToFile = fe.embedLinkFor(file);
            this.addAtCursor(embedLinkToFile);
          });
        } else {
          let linkString = "";
          files.forEach((file) => {
            if (files.length != 1) {
              linkString = linkString + fe.linkFor(file, true);
            } else {
              linkString = linkString + fe.linkFor(file, false);
            }
          });
          this.addAtCursor(linkString);
        }

        this.close();
        new Notice("Added File Link");
      } else {
        new Notice("No files selected");
      }
    });
  }

  addAtCursor(s: string) {
    let mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (mdView) {
      let doc = mdView.editor;
      var currentLine = doc.getCursor();
      doc.replaceRange(s, currentLine, currentLine);
    }
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}
