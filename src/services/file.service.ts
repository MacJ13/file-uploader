import fs from "fs/promises";
import { getFolderPathFromDB } from "./folder.service";
import prisma from "../config/prisma.config";
import { parseFilePath } from "../utils/helpers/parseFilePath";
import { normalizeFolderName } from "../utils/helpers/normalizeFolderName";
import cloudinary from "../config/cloudinary.config";
import { FileCreationType, FileResourceType } from "../types/file";

export const resolveUploadPath = async (
  username: string,
  folderId: number | null
) => {
  // 1. set path where we have to save files

  let path = "";

  if (!folderId) {
    path = `files/${username}/`;
  } else path = (await getFolderPathFromDB(username, folderId)) + "/";

  // console.log(path);
  // 2. create directory is necessery
  // await fs.mkdir(path, { recursive: true });

  const properPath = normalizeFolderName(path);
  // 3. return path
  return properPath;
};

export const uploadFileStream = async (
  folderName: string,
  file: Express.Multer.File
) => {
  const base = file.originalname.replace(/\.[^/.]+$/, ""); // "esp2"

  console.log(file);
  return new Promise((resolve, reject) => {
    const result = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "auto",
        public_id: base,
      },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary error:", error);
          reject(new Error("Something happened while uploading file"));
          // throw new Error("something happend to upload file");
        }

        resolve(result);
      }
    );

    result.end(file.buffer);
  });
};

export const saveFileToDB = async (fileCreation: FileCreationType) => {
  const ext = fileCreation.originalname.split(".").pop() || "";

  await prisma.file.create({
    data: {
      name: fileCreation.originalname,
      path: fileCreation.public_id,
      size: fileCreation.size,
      type: fileCreation.resource_type,
      format: ext,
      userId: fileCreation.userId,
      folderId: fileCreation.folderId,
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
      format: true,
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

  await cloudinary.uploader.destroy(file.path, { resource_type: file.type });
  // await fs.unlink(file.path);
  return file;
};

const updateCloudFileName = async (id: number, newFileName: string) => {
  const file = await getFileById(id);

  if (!file) throw new Error("file do not exist");

  const folderPath =
    file.path.lastIndexOf("/") >= 0
      ? file.path.slice(0, file.path.lastIndexOf("/"))
      : "";

  const newPublicId = folderPath ? `${folderPath}/${newFileName}` : newFileName;

  const renamed = await cloudinary.uploader.rename(file.path, newPublicId, {
    resource_type: file.type, // file.type, // np. "raw"
    overwrite: true,
  });

  await cloudinary.api.update(newPublicId, {
    display_name: newFileName,
    resource_type: file.type,
  });

  return {
    public_id: renamed.public_id as string,
    fileName: `${newFileName}.${file.format}`,
  };
};

export const updateFileNameInDB = async (
  id: number,
  fileName: string,
  newPath: string
) => {
  const updatedFile = await prisma.file.update({
    where: { id: id },
    data: { name: fileName, path: newPath },
  });

  return updatedFile;
};

export const updateFile = async (id: number, fileName: string) => {
  const newBase = fileName.replace(/\.[^/.]+$/, "");

  try {
    const { public_id, fileName } = await updateCloudFileName(id, newBase);

    await updateFileNameInDB(id, fileName, public_id);
  } catch (err) {
    console.log(err);
  }

  // await fs.rename(filePath, updatedFile.path);
};

export const replaceFilePath = async (oldPath: string, newPath: string) => {
  await prisma.$executeRaw`
    UPDATE "File"
    SET "path" = REPLACE("path", ${oldPath}, ${newPath})
    WHERE "path" LIKE '%' || ${oldPath} || '%'
  `;
};

export const getFileUrl = async (path: string, resourceType: string) => {
  const cloudFile = await cloudinary.api.resource(path, {
    type: "upload",
    resource_type: resourceType,
    secure: true,
  });

  return cloudFile.secure_url as string;
};

export const getFileResources = async (path: string) => {
  const files = await cloudinary.api.resources({
    type: "upload",
    prefix: path,
    resource_type: "raw",
  });

  return files.resources;
};

export const getFileResource = async (path: string) => {
  const file = await cloudinary.api.resource(path);

  return file;
};

export const getFileResourcesByPath = async (path: string) => {
  const resourceTypes: FileResourceType[] = ["image", "video", "raw"];
  const allFiles = [];

  for (const type of resourceTypes) {
    let nextCursor: string | undefined = undefined;

    do {
      const response = await cloudinary.api.resources({
        type: "upload",
        prefix: path,
        resource_type: type,
        max_results: 500, // maximum number results per page
        next_cursor: nextCursor,
      });

      allFiles.unshift(...response.resources);

      nextCursor = response.next_cursor;
    } while (nextCursor);
  }

  return allFiles;
};
