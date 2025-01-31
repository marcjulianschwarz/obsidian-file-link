import { Modal, App, Notice, MarkdownView } from "obsidian";
import FileLink from "../main";
import { FileEmbeder } from "./FileEmbeder";

export class FileLinkModal extends Modal {
  plugin: FileLink;
  selectedFilesDiv: HTMLDivElement;
  filePaths: string[] = [];

  constructor(app: App, plugin: FileLink) {
    super(app);
    this.plugin = plugin;
  }

  async onOpen() {
    const { contentEl } = this;

    const mainContainer = contentEl.createEl("div", {
      cls: "bfl-container",
    });

    const fileSelectionSection = mainContainer.createEl("div", {
      cls: "bfl-selection-section",
    });

    const fileButton = fileSelectionSection.createEl("button", {
      text: "Select files",
      cls: "mod-cta",
    });

    this.selectedFilesDiv = fileSelectionSection.createEl("div", {
      cls: "bfl-selected-files",
    });

    this.displaySelectedFiles([]);

    const checkboxContainer = mainContainer.createEl("div", {
      cls: "bfl-checkbox-container",
    });

    const createCheckboxGroup = (
      id: string,
      label: string,
      initialValue: boolean
    ) => {
      const wrapper = checkboxContainer.createEl("div", {
        cls: "bfl-checkbox-group",
      });

      const checkbox = wrapper.createEl("input", {
        type: "checkbox",
        attr: {
          id: id,
          style: "margin: 0;",
        },
      });

      wrapper.createEl("label", {
        text: label,
        attr: {
          for: id,
          style: "margin: 0; user-select: none;",
        },
      });

      checkbox.checked = initialValue;
      return checkbox;
    };

    const checkboxEmbed = createCheckboxGroup(
      "embed",
      "Embed file",
      this.plugin.settings.embedFile
    );

    const checkboxFileFolder = createCheckboxGroup(
      "file-folder",
      "Link folder",
      this.plugin.settings.linkFolder
    );

    const checkboxFileEnding = createCheckboxGroup(
      "file-ending",
      "Show file extension",
      this.plugin.settings.showFileEnding
    );

    const buttonContainer = mainContainer.createEl("div", {
      cls: "button-container",
      attr: {
        style: "margin-top: 5px;",
      },
    });

    const submitButton = buttonContainer.createEl("button", {
      text: "Add file link",
      cls: "mod-cta",
    });

    fileButton.addEventListener("click", async () => {
      const d = require("electron").remote.dialog;

      try {
        const result = await d.showOpenDialog({
          properties: ["openFile", "multiSelections"],
          filters: [{ name: "All Files", extensions: ["*"] }],
        });

        if (!result.canceled && result.filePaths.length > 0) {
          this.filePaths = result.filePaths;
          this.displaySelectedFiles(this.filePaths);
        }
      } catch (error) {
        new Notice("Error selecting files: " + error.message);
      }
    });

    submitButton.addEventListener("click", () => {
      if (this.filePaths.length > 0) {
        // Update settings
        this.plugin.settings.linkFolder = checkboxFileFolder.checked;
        this.plugin.settings.showFileEnding = checkboxFileEnding.checked;
        this.plugin.settings.embedFile = checkboxEmbed.checked;

        const fe = new FileEmbeder(this.plugin.settings);

        if (checkboxEmbed.checked) {
          this.filePaths.forEach((file) => {
            const embedMarkdownLink = fe.getEmbedMarkdownLink(file);
            this.addAtCursor(embedMarkdownLink);
          });
        } else {
          let linkString = "";
          this.filePaths.forEach((file) => {
            linkString += fe.getMarkdownLink(file, this.filePaths.length > 1);
          });
          this.addAtCursor(linkString);
        }

        this.close();
        new Notice(`Added ${this.filePaths.length} file link(s)`);
      } else {
        new Notice("No files selected");
      }
    });
  }

  private displaySelectedFiles(files: string[]) {
    this.selectedFilesDiv.empty();

    if (files.length === 0) {
      this.selectedFilesDiv.createEl("p", {
        text: "No files selected",
        cls: "no-files-message",
        attr: {
          style:
            "color: var(--text-muted); font-style: italic; margin: 0; padding: 8px;",
        },
      });
      return;
    }

    const fileList = this.selectedFilesDiv.createEl("ul", {
      cls: "selected-files-list",
      attr: {
        style: "list-style: none; padding: 0; margin: 0;",
      },
    });

    files.forEach((filePath) => {
      const fileName = filePath.split(/[\\/]/).pop() || filePath;
      fileList.createEl("li", {
        text: fileName,
        cls: "selected-file-item",
        attr: {
          style:
            "padding: 4px 8px; border-bottom: 1px solid var(--background-modifier-border);",
        },
      });
    });
  }

  addAtCursor(s: string) {
    const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (markdownView) {
      const editor = markdownView.editor;
      const currentLine = editor.getCursor();
      editor.replaceRange(s, currentLine, currentLine);
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
