import path from "path";
import prisma from "../config/prisma.config";
import fsExtra from "fs-extra";
import fs from "fs";
import cloudinary from "../config/cloudinary.config";
import { normalizeFolderName } from "../utils/helpers/normalizeFolderName";
import { replaceFilePath } from "./file.service";

export const createFolder = async (
  title: string,
  userId: number,
  parentFolderId?: number | null
) => {
  await prisma.folder.create({
    data: {
      name: title,
      userId: userId,
      parentFolderId: parentFolderId ?? null,
    },
  });
};

export const getUserFolders = async (
  userId: number,
  parentFolderId: number | null = null
) => {
  const folders = await prisma.folder.findMany({
    where: { userId: userId, parentFolderId: parentFolderId },
    select: { id: true, name: true, parentFolderId: true, created_at: true },
    orderBy: { created_at: "desc" },
  });

  return folders;
};

export const getFolderById = async (id: number) => {
  const folder = await prisma.folder.findUnique({
    where: { id: id },
    select: {
      id: true,
      name: true,
      parentFolderId: true,
      parentFolder: { select: { id: true, name: true } },
      subfolders: {
        select: { id: true, name: true, created_at: true },
        orderBy: { created_at: "desc" },
      },
      files: {
        select: {
          id: true,
          name: true,
          created_at: true,
          path: true,
          folder: { select: { name: true } },
        },
        orderBy: { created_at: "desc" },
      },
    },
  });

  return folder;
};

export const updateFolderVisitedDate = async (id: number) => {
  await prisma.folder.update({
    where: { id: id },
    data: { visited_at: new Date() },
  });
};

export const getFolderName = async (id: number) => {
  const folder = await prisma.folder.findUnique({
    where: { id: id },
    select: { name: true },
  });

  return folder?.name;
};

export const updateFolder = async (
  newFolderName: string,
  id: number,
  username: string
) => {
  // 1. get folder by id

  // const folder = await getFolderById(id);

  // 3. get full old path and create below new full path
  const oldPath = await getFolderPathFromDB(username, id);

  const newPath = path.join(path.dirname(oldPath), newFolderName);

  if (oldPath === newPath) {
    return;
  }

  const properOldPath = normalizeFolderName(oldPath);
  const properNewPath = normalizeFolderName(newPath);
  console.log({ properOldPath, properNewPath });

  // const result = await prisma.$queryRaw`
  // SELECT * FROM "File" WHERE "path" LIKE '%' || ${properOldPath} || '%'
  // `;
  // console.log({ result });
  // const properNewPath = normalizeFolderName(newPath);

  const files = await cloudinary.api.resources({
    type: "upload",
    prefix: `${properOldPath}`,
    resource_type: "raw",
  });
  console.log(files);

  const oldPrefix = properOldPath; // np. "files/user12/folder_test"
  const newPrefix = properNewPath; // np. "files/user12/folder_update"

  for (const file of files.resources) {
    const newPublicId = file.public_id.replace(oldPrefix, newPrefix);

    console.log(newPublicId);
    // console.log(newPublicId);

    await cloudinary.uploader.rename(file.public_id, newPublicId, {
      resource_type: file.resource_type,
      overwrite: true,
    });
  }

  await updateFolderName(id, newFolderName);

  await replaceFilePath(properOldPath, properNewPath);
};

export const updateFolderName = async (id: number, newFolderName: string) => {
  await prisma.folder.update({
    where: { id: id },
    data: { name: newFolderName },
  });
};

export const getParentFolder = async (id: number) => {
  const folder = await prisma.folder.findUnique({
    where: { id: id },
    select: { parentFolder: { select: { id: true, name: true } } },
  });

  return folder ? folder.parentFolder : null;
};

export const deleteFolder = async (id: number) => {
  return await prisma.folder.delete({ where: { id: id } });
};

const getFullPathFolderDirectory = (username: string, parts: string[]) => {
  const fullPath = path.join("files", username, ...parts);

  return fullPath;
};

export const getFolderPathFromDB = async (
  username: string,
  folderId: number
): Promise<string> => {
  let parts: string[] = [];

  let currentFolder = await getFolderById(folderId);

  while (currentFolder) {
    parts.unshift(currentFolder.name);

    if (!currentFolder.parentFolderId) break;
    currentFolder = await getFolderById(currentFolder.parentFolderId);
  }

  const fullPath = getFullPathFolderDirectory(username, parts);

  return fullPath;
};

export const removeCloudFolder = async (
  public_id: string,
  resource_type: string
) => {
  await cloudinary.uploader.destroy(public_id, {
    resource_type: resource_type,
  });
};

// update all file with path like oldFoldername in string
// await prisma.$executeRaw`
//   UPDATE "File"
//   SET "path" = REPLACE("path", ${oldFolderName}, ${newFolderName})
//   WHERE "path" LIKE '%' || ${oldFolderName} || '%'
// `;

// for (const file of files.resources) {
//   // console.log(file);

//   const properOldFolderName = normalizeFolderName(oldFolderName);
//   const properNewFolderName = normalizeFolderName(newFolderName);

//   const newPublicId = file.public_id.replace(
//     properOldFolderName,
//     properNewFolderName
//   );

//   console.log(newPublicId, file.public.id);

//   // await cloudinary.uploader.rename(file.public_id, newPublicId, {
//   //   resource_type: file.resource_type,
//   //   overwrite: true,
//   // });

//   // console.log(file.public_id, newPublicId);
// }

// folder?.files.forEach((file) => {
//   console.log(file);
// });
//   await prisma.folder.update({
//   where: { id: id },
//   data: { name: newFolderName },
// });
//   await prisma.folder.update({
//   where: { id: id },
//   data: { name: newFolderName },
// });

// files.resources.forEach((file) => {
//   console.log(file);
// });

// if (fs.existsSync(oldPath)) {
//   await fsExtra.copy(oldPath, newPath);
//   await fsExtra.remove(oldPath);
// }

// update all file with path like oldFoldername in string
// await prisma.$executeRaw`
//   UPDATE "File"
//   SET "path" = REPLACE("path", ${oldFolderName}, ${newFolderName})
//   WHERE "path" LIKE '%' || ${oldFolderName} || '%'
// `;
