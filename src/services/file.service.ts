import fs from "fs/promises";
import { getFolderPathFromDB } from "./folder.service";
import prisma from "../config/prisma.config";
import { parseFilePath } from "../utils/helpers/parseFilePath";
import { normalizeFolderName } from "../utils/helpers/normalizeFolderName";
import cloudinary from "../config/cloudinary.config";
import { FileCreationType, FileResourceType } from "../types/file";
import CustomError from "../utils/errors/CustomError";

export const resolveUploadPath = async (
  username: string,
  folderId: number | null
) => {
  try {
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
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    } else throw new CustomError("Database internal error", 500);
  }
  // 1. set path where we have to save files
};

export const uploadFileStream = async (
  folderName: string,
  file: Express.Multer.File
) => {
  const base = file.originalname.replace(/\.[^/.]+$/, ""); // "esp2"

  return new Promise((resolve, reject) => {
    const result = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "auto",
        public_id: base,
      },
      async (error, result) => {
        if (error) {
          reject(new CustomError("Failed to upload file stream", 500));
          // throw new Error("something happend to upload file");
        }

        resolve(result);
      }
    );

    result.end(file.buffer);
  });
};

export const saveFileToDB = async (fileCreation: FileCreationType) => {
  try {
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
  } catch (err) {
    throw new CustomError("Database error while saving file", 500);
  }
};

export const getUserFiles = async (
  userId: number,
  folderId: number | null = null
) => {
  try {
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
  } catch (err) {
    throw new CustomError("Database error while fetching file list", 500);
  }
};

export const getFileById = async (id: number) => {
  try {
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
  } catch (err) {
    throw new CustomError("Database error while fetching file by id", 500);
  }
};

export const deleteFile = async (id: number) => {
  try {
    return await prisma.file.delete({ where: { id: id } });
  } catch (err) {
    throw new CustomError("Database error while deleting file", 500);
  }
};

export const deleteFileWithPhysicalRemove = async (id: number) => {
  try {
    const file = await deleteFile(id);

    await deletePhysicalFile(file.path, file.type);
    return file;
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    } else
      throw new CustomError(
        "Internal Service Error while deleting file process",
        500
      );
  }
};

export const deletePhysicalFile = async (
  path: string,
  resourceType: string
) => {
  await cloudinary.uploader.destroy(path, { resource_type: resourceType });
};

const updateCloudFileName = async (id: number, newFileName: string) => {
  const file = await getFileById(id);

  if (!file) throw new CustomError("File do not exist", 404);

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
  try {
    const updatedFile = await prisma.file.update({
      where: { id: id },
      data: { name: fileName, path: newPath },
    });

    return updatedFile;
  } catch (err) {
    throw new CustomError("Database error while updating file name", 500);
  }
};

export const updateFile = async (id: number, fileName: string) => {
  const newBase = fileName.replace(/\.[^/.]+$/, "");

  try {
    const { public_id, fileName } = await updateCloudFileName(id, newBase);

    await updateFileNameInDB(id, fileName, public_id);
  } catch (err) {
    if (err instanceof CustomError) throw err;
    else
      throw new CustomError("Internal server error while updating file", 500);
  }

  // await fs.rename(filePath, updatedFile.path);
};

export const replaceFilePath = async (oldPath: string, newPath: string) => {
  try {
    await prisma.$executeRaw`
  UPDATE "File"
  SET "path" = REPLACE("path", ${oldPath}, ${newPath})
  WHERE "path" LIKE '%' || ${oldPath} || '%'
`;
  } catch (err) {
    throw new CustomError("Database error while replace file path", 500);
  }
};

export const getFileUrl = async (path: string, resourceType: string) => {
  try {
    const cloudFile = await cloudinary.api.resource(path, {
      type: "upload",
      resource_type: resourceType,
      secure: true,
    });

    return cloudFile.secure_url as string;
  } catch (error) {
    throw new CustomError("Failed to fetch file resource url", 500);
  }
};

export const getFileResources = async (path: string) => {
  try {
    const files = await cloudinary.api.resources({
      type: "upload",
      prefix: path,
      resource_type: "raw",
    });

    return files.resources;
  } catch (error) {
    throw new CustomError("Failed to fetch file resources", 500);
  }
};

// export const getFileResource = async (path: string) => {
//   const file = await cloudinary.api.resource(path);

//   return file;
// };

export const getFileResourcesByPath = async (path: string) => {
  try {
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
  } catch (error) {
    throw new CustomError("Failed to fetch file resources by path", 500);
  }
};
