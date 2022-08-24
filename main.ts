import { Plugin } from "obsidian";

import { FileLinkSettings } from "./src/interfaces";
import { DEFAULT_SETTINGS } from "./src/constants";
import { FileLinkSettingTab } from "./src/FileLinkSettingsTab";
import { FileLinkModal } from "./src/FileLinkModal";

export default class FileLink extends Plugin {
  settings: FileLinkSettings;

  async onload() {
    console.log("loading plugin file-link");

    await this.loadSettings();

    this.addSettingTab(new FileLinkSettingTab(this.app, this));

    this.addCommand({
      id: "add-file-link",
      name: "Add File Link",

      editorCallback: () => {
        new FileLinkModal(this.app, this).open();
      },
    });
  }

  onunload() {
    console.log("unloading plugin file-link");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
