import path from "path";
import fs from "fs/promises";
import { getFolderName } from "./folder.service";
import prisma from "../config/prisma.config";
import Path from "path";

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

export const saveFileToDB = async (
  file: Express.Multer.File | undefined,
  userId: number,
  folderId: number | null = null
) => {
  if (!file) return;

  await prisma.file.create({
    data: {
      name: file.originalname,
      path: file.path,
      size: file.size,
      type: file.mimetype,
      userId: userId,
      folderId: folderId,
    },
  });
};

export const getUserFiles = async (
  userId: number,
  folderId: number | null = null
) => {
  const files = await prisma.file.findMany({
    where: { userId: userId },
    select: {
      id: true,
      name: true,
      created_at: true,
      folder: { select: { name: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return files;
};

export const getFileById = async (id: number) => {
  const file = await prisma.file.findUnique({
    where: { id: id },
    select: {
      name: true,
      id: true,
      size: true,
      path: true,
      type: true,
      created_at: true,
      folder: { select: { name: true, id: true } },
    },
  });

  return file;
};

export const deleteFile = async (id: number) => {
  return await prisma.file.delete({ where: { id: id } });
};

export const deleteFileWithPhysicalRemove = async (id: number) => {
  const file = await deleteFile(id);

  await fs.unlink(file.path);
  return file;
};
