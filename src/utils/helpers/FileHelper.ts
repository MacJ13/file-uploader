export class FileHelper {
  static splitFileName(name: string) {
    const splittedFileName = name.split(".");

    const fileName = splittedFileName[0];
    const fileExtension = splittedFileName[1];

    return { fileName, fileExtension };
  }

  static getBaseName(filename: string) {
    return filename.replace(/\.[^/.]+$/, "");
  }

  static getExtension(filename: string) {
    return filename.split(".").pop() || "";
  }
}
