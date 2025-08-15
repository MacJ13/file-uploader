import path from "path";
import prisma from "../config/prisma.config";
import fsExtra from "fs-extra";
import fs from "fs";

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

export const updateFolderName = async (
  newFolderName: string,
  id: number,
  username: string
) => {
  // 1. get folder by id
  const folder = await getFolderById(id);

  const oldFolderName = folder?.name as string;

  // 3. get full old path and create below new full path
  const oldPath = await getFolderPathFromDB(username, id);
  const newPath = path.join(path.dirname(oldPath), newFolderName);

  if (oldPath === newPath) {
    return;
  }

  if (fs.existsSync(oldPath)) {
    await fsExtra.copy(oldPath, newPath);
    await fsExtra.remove(oldPath);
  }

  await prisma.folder.update({
    where: { id: id },
    data: { name: newFolderName },
  });

  // update all file with path like oldFoldername in string
  await prisma.$executeRaw`
    UPDATE "File" 
    SET "path" = REPLACE("path", ${oldFolderName}, ${newFolderName})
    WHERE "path" LIKE '%' || ${oldFolderName} || '%'
  `;
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
