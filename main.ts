import { App, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

export default class FilesLink extends Plugin {

	async onload() {
		console.log('loading plugin');

		this.addCommand({
			id: 'add-file-link',
			name: 'Add File Link',

			checkCallback: (checking: boolean) => {
				let leaf = this.app.workspace.activeLeaf;
				if (leaf) {
					if (!checking) {
						new FilesLinkModal(this.app).open();
					}
					return true;
				}
				return false;
			}
		});
	}

	onunload() {
		console.log('unloading plugin');
	}
}


class FilesLinkModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		let {contentEl} = this;
        
		let html = '<h1>Select files.</h1><input type="file" multiple /> <br><br><button>Add File Link</button>';
  	
		contentEl.innerHTML = html;

		contentEl.querySelector("button").addEventListener("click", () => {

			let st = "";

            [...contentEl.querySelector("input").files].forEach(file => {

                let url: string = file.path
                let urlComponents = url.split("/")
                let title = urlComponents.pop()
                url = urlComponents.join("/").substr(1);
                st = st + "[" + title + "](file:///" + encodeURIComponent(url) + ")\n"

            });
			
			let mdView = this.app.workspace.activeLeaf.view;
            let doc = mdView.editor;
			var currentLine = doc.getCursor();
        	doc.replaceRange(st, currentLine, currentLine);

            this.close()

            new Notice("Added File Link")
		});
	}

	onClose() {
		let {contentEl} = this;
		contentEl.empty();
	}
}