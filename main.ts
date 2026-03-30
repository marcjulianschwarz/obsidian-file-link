import { Plugin, Notice } from "obsidian";

import { FileLinkSettings } from "./src/interfaces";
import { DEFAULT_SETTINGS } from "./src/constants";
import { FileLinkSettingTab } from "./src/FileLinkSettingsTab";
import { FileLinkModal } from "./src/FileLinkModal";
import { findBrokenFileLinks } from "./src/BrokenLinksChecker";
import { BrokenLinksModal } from "./src/BrokenLinksModal";

export default class FileLink extends Plugin {
  settings: FileLinkSettings = DEFAULT_SETTINGS;

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

    this.addCommand({
      id: "check-broken-file-links",
      name: "Check for broken file links",

      callback: async () => {
        new Notice("Scanning for broken file links...");
        const brokenLinks = await findBrokenFileLinks(this.app.vault);

        if (brokenLinks.size === 0) {
          new Notice("No broken file links found.");
          return;
        }

        new BrokenLinksModal(this.app, brokenLinks).open();
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
