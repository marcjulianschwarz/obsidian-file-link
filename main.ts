import { App, Modal, Plugin, PluginSettingTab, Setting,  Notice, MarkdownView } from 'obsidian';

interface FileLinkSettings {
	linkPrefix: string;
	showFileEnding: boolean;
	linkFolder: boolean;
}

const DEFAULT_SETTINGS: FileLinkSettings = {
	linkPrefix: '', 
	showFileEnding: false,
	linkFolder: false
}

export default class FileLink extends Plugin {

	settings: FileLinkSettings;

	async onload() {
		console.log('loading plugin file-link');

		await this.loadSettings();

		this.addSettingTab(new FileLinkSettingTab(this.app, this));

		this.addCommand({
			id: 'add-file-link',
			name: 'Add File Link',

			editorCheckCallback: (checking: boolean) => {
				if (!checking) {
					new FilesLinkModal(this.app, this).open()
				}else{
					return true
				}
			}

		});
	}

	onunload() {
		console.log('unloading plugin file-link');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


class FilesLinkModal extends Modal {

	plugin: FileLink;

	constructor(app: App, plugin: FileLink) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		let {contentEl} = this;
		contentEl.createEl("h3", {text: "Select files:"});
		let input = contentEl.createEl("input", {type: "file", attr: {multiple: ""}});
		let button = contentEl.createEl("button", {text: "Add file link"});
		
		button.addEventListener("click", () => {

			let linkString = "";

			let files = Array.from(input.files);

            [...files].forEach(file => {
			
				if (files.length != 1) {
					linkString = linkString + this.buildLinkFromFile(file, true);
				}else{
					linkString = linkString + this.buildLinkFromFile(file, false);
				}
			});

			this.addAtCursor(linkString);
            this.close();
            new Notice("Added File Link");
		});
	}

	addAtCursor(s: string){
		let mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
        let doc = mdView.editor;
		var currentLine = doc.getCursor();
        doc.replaceRange(s, currentLine, currentLine);
	}

	buildLinkFromFile(file: File, prefix: boolean){
		let url: string = file.path;
		let urlComponents = url.split("/");
		let title = urlComponents[urlComponents.length - 1];
		let prefixString = "";

		if (!this.plugin.settings.showFileEnding){
			let titleComponents = title.split(".");
			titleComponents.pop();
			title = titleComponents.join(".");
		}
		if (this.plugin.settings.linkFolder){
			urlComponents.pop();
			url = urlComponents.join("/").substr(1);
		}
		if (prefix){
			prefixString = this.plugin.settings.linkPrefix;
		}


		return prefixString + " [" + title + "](file:///" + encodeURIComponent(url) + ")\n";
	}


	onClose() {
		let {contentEl} = this;
		contentEl.empty();
	}
}

class FileLinkSettingTab extends PluginSettingTab {
	plugin: FileLink;

	constructor(app: App, plugin: FileLink) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;
		containerEl.empty();
		containerEl.createEl('h2', {text: 'Settings for File Link'});

		new Setting(containerEl)
			.setName('List style for multiple files')
			.setDesc('Specify the characters shown before every file link.')
			.addText(text => text
				.setPlaceholder('-')
				.setValue(this.plugin.settings.linkPrefix)
				.onChange(async (value) => {
					this.plugin.settings.linkPrefix = value;
					await this.plugin.saveSettings();
				})
			);
		
		new Setting(containerEl)
			.setName('Show file extension')
			.setDesc('Will show file endings when activated.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showFileEnding)
				.onChange(async () => {
					this.plugin.settings.showFileEnding = toggle.getValue();
					await this.plugin.saveSettings();
				})
			);
		
		new Setting(containerEl)
			.setName('Link folder instead of file')
			.setDesc('Link will open the folder where the file is located instead of opening the file itself.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.linkFolder)
				.onChange(async () => {
					this.plugin.settings.linkFolder = toggle.getValue();
					await this.plugin.saveSettings();
				})
			);
	}
}