import { PluginSettingTab, App, Setting } from "obsidian";
import FileLink from "../main";

export class FileLinkSettingTab extends PluginSettingTab {
  plugin: FileLink;

  constructor(app: App, plugin: FileLink) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Better File Link Settings" });

    new Setting(containerEl)
      .setName("List style for multiple files")
      .setDesc("Specify the characters shown before every file link.")
      .addText((text) =>
        text
          .setPlaceholder("-")
          .setValue(this.plugin.settings.linkPrefix)
          .onChange(async (value) => {
            this.plugin.settings.linkPrefix = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Show file extension")
      .setDesc("Will show file endings when activated.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showFileEnding)
          .onChange(async () => {
            this.plugin.settings.showFileEnding = toggle.getValue();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Embed file")
      .setDesc("Will copy the file to Obsidian and embed it in the note.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.embedFile).onChange(async () => {
          this.plugin.settings.embedFile = toggle.getValue();
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Link folder instead of file")
      .setDesc(
        "Link will open the folder where the file is located instead of opening the file itself."
      )
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.linkFolder).onChange(async () => {
          this.plugin.settings.linkFolder = toggle.getValue();
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Use short links")
      .setDesc("Use short links instead of long links.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.shortLinks).onChange(async () => {
          this.plugin.settings.shortLinks = toggle.getValue();
          await this.plugin.saveSettings();
        })
      );
  }
}
