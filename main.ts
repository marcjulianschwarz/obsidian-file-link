import { App, Modal, Plugin, PluginSettingTab, Setting,  Notice, MarkdownView, Vault } from 'obsidian';

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

			editorCallback: () => {
				new FileLinkModal(this.app, this).open()
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


class FileLinkModal extends Modal {

	plugin: FileLink;

	constructor(app: App, plugin: FileLink) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		let {contentEl} = this;
		contentEl.createEl("h3", {text: "Select files:"});
		let input = contentEl.createEl("input", {type: "file", attr: {multiple: ""}});
		contentEl.createEl("br");
		contentEl.createEl("br");
		contentEl.createEl("label", {text: "Embed file?", attr: {for: "embed"}});
		let checkbox = contentEl.createEl("input", {type: "checkbox", attr: {id: "embed"}});
		contentEl.createEl("br");
		contentEl.createEl("br");
		contentEl.createEl("br");
		let button = contentEl.createEl("button", {text: "Add file link"});

		button.addEventListener("click", () => {

			let embedFile = checkbox.checked;
			let files = Array.from(input.files);


			if (embedFile){
				files.forEach((file: File) => {
					//@ts-ignore
					this.copyFile(file.path, this.app.vault.adapter.basePath + "/" + this.app.vault.config.attachmentFolderPath);
					this.addAtCursor(this.createEmbedLink(file));
				});
			}else{
				let linkString = "";
				files.forEach((file) => {
					if (files.length != 1) {
						linkString = linkString + this.buildLinkFromFile(file, true);
					}else{
						linkString = linkString + this.buildLinkFromFile(file, false);
					}
				});
				this.addAtCursor(linkString);
			}

            this.close();
            new Notice("Added File Link");
		});
	}

	createEmbedLink(file){
		let url: string = file.path;
		let urlComponents = url.split("/");
		let title = urlComponents[urlComponents.length - 1];
		return "![[" + title + "]]";
	}

	copyFile(file, dir2){
		var fs = require('fs');
		var path = require('path');
	  
		var f = path.basename(file);
		var source = fs.createReadStream(file);
		var dest = fs.createWriteStream(path.resolve(dir2, f));
	  
		source.pipe(dest);
		source.on('end', function() { console.log('Succesfully copied'); });
		source.on('error', function(err) { console.log(err); });
	}


	addAtCursor(s: string){
		let mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
        let doc = mdView.editor;
		var currentLine = doc.getCursor();
        doc.replaceRange(s, currentLine, currentLine);
	}

	buildLinkFromFile(file: File, prefix: boolean){
		//@ts-ignore
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
		containerEl.createEl('h2', {text: 'Better File Link Settings'});

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