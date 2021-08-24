import { App, Modal, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface FileLinkSettings {
	linkPrefix: string;
	showFileEnding: boolean;
}

const DEFAULT_SETTINGS: FileLinkSettings = {
	linkPrefix: '', 
	showFileEnding: false
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

			checkCallback: (checking: boolean) => {
				let leaf = this.app.workspace.activeLeaf;
				if (leaf) {
					if (!checking) {
						new FilesLinkModal(this.app, this).open();
					}
					return true;
				}
				return false;
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
		let html = '<h3 style="margin-top: 0px;">Select files:</p><input type="file" multiple /> <br><br><button>Add File Link</button>';
		contentEl.innerHTML = html;

		contentEl.querySelector("button").addEventListener("click", () => {

			let linkString = "";

            [...contentEl.querySelector("input").files].forEach(file => {
				linkString = linkString + this.buildLinkFromFile(file);
            });

			this.addAtCursor(linkString);
            this.close()
            //new Notice("Added File Link")
		});
	}

	addAtCursor(s: string){
		let mdView = this.app.workspace.activeLeaf.view;
        let doc = mdView.editor;
		var currentLine = doc.getCursor();
        doc.replaceRange(s, currentLine, currentLine);
	}

	buildLinkFromFile(file: File){
		let url: string = file.path
		let urlComponents = url.split("/")
		let title = urlComponents.pop()

		console.log("HALLLLO");
		console.log(this.plugin.settings.showFileEnding);

		if (!this.plugin.settings.showFileEnding){
			title = title.split(".")[0];
			console.log(title);
		}

		url = urlComponents.join("/").substr(1);
		return this.plugin.settings.linkPrefix + " [" + title + "](file:///" + encodeURIComponent(url) + ")\n"
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
				}));
		
		new Setting(containerEl)
			.setName('Show file extension')
			.setDesc('Will show file endings when activated.')
			.addToggle(toggle => toggle
				.onChange(async () => {
					console.log(toggle.getValue());
					this.plugin.settings.showFileEnding = toggle.getValue();
					await this.plugin.saveSettings();
				})
			)
	}
}