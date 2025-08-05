import path from "path";
import fs from "fs/promises";
import { getFolderName } from "./folder.service";

export const resolveUploadPath = async (username: string, folderId: number) => {
  // 1. get folder name

  const folderName = await getFolderName(folderId);
  // 2. set path where we have to save files

  const filePath = path.join("public", "files", username, folderName || "");
  // 3. create directory is necessery
  await fs.mkdir(filePath, { recursive: true });

  // 4. return path
  return filePath;
};
