import { SUPPORTED_EMBED_FILE_TYPES } from "./constants";
import { Notice } from "obsidian";
import fs from "fs";
import path from "path";
import { FileLinkSettings } from "./interfaces";

export class FileEmbeder {
  attachementFolder: string;
  basePath: string;
  settings: FileLinkSettings;

  constructor(
    attachementFolder: string,
    basePath: string,
    settings: FileLinkSettings
  ) {
    this.attachementFolder = attachementFolder;
    this.basePath = basePath;
    this.settings = settings;
  }

  embedFile(file: File) {
    let fileType = file.name.split(".").pop() ?? "";
    if (SUPPORTED_EMBED_FILE_TYPES.contains(fileType)) {
      if (!this.attachementFolder) {
        this.attachementFolder = "";
      }
      //@ts-ignore
      this.copyFile(file.path, this.basePath + "/" + this.attachementFolder);
    } else {
      new Notice(
        "This file type (" + fileType + ") is not supported for embed."
      );
    }
  }

  embedLinkFor(file: File) {
    let { filename } = this.pathInfo(file);
    return "![[" + filename + "]]";
  }

  copyFile(file: string, dir2: string) {
    var f = path.basename(file);
    var source = fs.createReadStream(file);
    var dest = fs.createWriteStream(path.resolve(dir2, f));

    source.pipe(dest);
    source.on("end", function () {
      console.log("Succesfully copied");
    });
    source.on("error", function (err) {
      console.log(err);
    });
  }

  pathInfo(file: File) {
    //@ts-ignore
    let path: string = file.path;
    let pathComponents = path.split("/");

    if (path.contains("\\")) {
      pathComponents = path.split("\\");
    }

    let filename = pathComponents.pop() ?? "";

    return { path, pathComponents, filename };
  }

  linkFor(file: File, printPrefix: boolean) {
    let { path, pathComponents, filename: linkName } = this.pathInfo(file);
    let prefixString = "";

    if (!this.settings.showFileEnding) {
      let filenameComponents = linkName.split(".");
      filenameComponents.pop();
      linkName = filenameComponents.join(".");
    }

    if (this.settings.linkFolder) {
      linkName = pathComponents[pathComponents.length - 1]; // .peek()
      path = pathComponents.join("/");
    }

    if (printPrefix) {
      prefixString = this.settings.linkPrefix;
    }

    if (this.settings.shortLinks) {
      return prefixString + "[" + linkName + "](<file:///" + path + ">)\n";
    }

    return (
      prefixString +
      "[" +
      linkName +
      "](file:///" +
      encodeURIComponent(path) +
      ")\n"
    );
  }
}
