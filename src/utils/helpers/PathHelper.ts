import path from "path";

export class PathHelper {
  //  get folder from path file
  static getFolderPath(filePath: string): string {
    return filePath.lastIndexOf("/") >= 0
      ? filePath.slice(0, filePath.lastIndexOf("/"))
      : "";
  }

  // build full path directory user
  static getFullPathFolderDirectory(username: string, parts: string[]): string {
    return path.join("file", username, ...parts);
  }

  // return parent directory to given path
  static getDirectoryPath(fpath: string): string {
    const tempPath = fpath.split("/");
    tempPath.pop();
    return tempPath.join("/");
  }

  // normalize folder name (change backslash to slash and space to _)
  static normalizeFolderName(folder: string): string {
    return folder.replace(/\\/g, "/").replace(/\s+/g, "_");
  }

  static replaceSubstring(
    fpath: string,
    oldWord: string,
    newWord: string
  ): string {
    return fpath.replace(oldWord, newWord);
  }

  static getMainUserPath(username: string): string {
    return this.normalizeFolderName(path.join("files", username));
  }

  // create new path changing folder name
  static changeFolderName(oldPath: string, newFolderName: string): string {
    return path.join(path.dirname(oldPath), newFolderName);
  }
}
