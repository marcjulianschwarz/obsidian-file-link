<p align="center">
  <img width="500" alt="link_peach_transparent" src="https://user-images.githubusercontent.com/67844154/158657066-47b6b0fb-439c-4973-82c7-9768ee472344.png">

</p>

# Better File Link

With this Obsidian plugin you can easily add file links to your notes. It features an interface to select files right from within Obsidian. No need to open a new Finder/File Explorer window to manually drag and drop files to your note.

Other features and settings to improve file links:
- custom prefix shown before every file link when adding multiple files
- toggle visibility of file endings
- decide if the file link should open the file or the folder where the file is located in
- embed file in note instead of only linking it

These file types are supported for embedding:
- Markdown: `md`
- Images: `png`, `jpg`, `jpeg`, `gif`, `bmp`, `svg`
- Audio: `mp3`, `webm`, `wav`, `m4a`, `ogg`, `3gp`, `flac`
- Video: `mp4`, `webm`, `ogv`
- PDF: `pdf`


## How to use it:
1. Open command palette with "cmd + p"
2. Search for the command "Add file link"
3. Click "Select files"
4. Now choose your files
5. Decide whether you want to embed the file by selecting the checkbox 
6. Then press "Add file link"

## Demo

https://user-images.githubusercontent.com/67844154/131221777-2ad1c138-90a5-4429-b481-380f8618d6ad.mp4

## Settings

### 1. List style
If you add multiple file links you can specify the characters shown before every link file.

### 2. File extension
When activated, all file extensions will be shown.

### 3. Link folder instead of file
When activated, clicking on the link will not open the file. Instead the folder where the file is located in will be opened.

### Settings image
![Settings](https://user-images.githubusercontent.com/67844154/131246371-68049aa6-34a5-421c-b478-513427525700.png)


## Contributions
Icon design: <a href="https://www.olli-graphics.de">Olli Graphics</a>

## Future versions will include:
See <a href="https://github.com/marcjulianschwarz/obsidian-file-link/issues">issues for Better File Link</a>.

## Versions
The numbers in "[]" are the issue numbers associated with the fix or feature.

*1.0.0*: 
- Initital release.

*1.0.1*:
- Bug fixes
- New setting: Link folders instead of files

*1.0.2*:
- Name and description changes

*1.0.3*:
- Fixed plugin id mismatch

*1.1.0*:
- You can now embed files instead of linking them
- [#3] Select options right in pop-up

*1.1.1*:
- [#1] Fixed bugs with windows paths

*1.1.2*:
- Security fix (moment.js)

*1.1.3*:
- [#10] Add short links option to settings