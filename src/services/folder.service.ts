// import path from "path";
import prisma from "../config/prisma.config";
import cloudinary from "../config/cloudinary.config";
// import { normalizeFolderName } from "../utils/helpers/normalizeFolderName";
import { replaceFilePath } from "./file.service";
import CustomError from "../utils/errors/CustomError";
import { PathHelper } from "../utils/helpers/PathHelper";

export const createFolder = async (
  title: string,
  userId: number,
  parentFolderId?: number | null
) => {
  try {
    await prisma.folder.create({
      data: {
        name: title,
        userId: userId,
        parentFolderId: parentFolderId ?? null,
      },
    });
  } catch (err) {
    throw new CustomError("Database error while creating folder", 500);
  }
};

export const getUserFolders = async (
  userId: number,
  parentFolderId: number | null = null
) => {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: userId, parentFolderId: parentFolderId },
      select: { id: true, name: true, parentFolderId: true, created_at: true },
      orderBy: { created_at: "desc" },
    });

    return folders;
  } catch (err) {
    throw new CustomError("Database error while fetching user folders", 500);
  }
};

export const getFolderById = async (id: number) => {
  try {
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
  } catch (err) {
    throw new CustomError("Database error while fetching folder by id", 500);
  }
};

export const updateFolderVisitedDate = async (id: number) => {
  try {
    await prisma.folder.update({
      where: { id: id },
      data: { visited_at: new Date() },
    });
  } catch (err) {
    throw new CustomError(
      "Database error while updating folder visited date",
      500
    );
  }
};

export const getFolderName = async (id: number) => {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: id },
      select: { name: true },
    });

    return folder?.name as string;
  } catch (err) {
    throw new CustomError("Database error while fetching name folder", 500);
  }
};

export const updateFolder = async (
  newFolderName: string,
  id: number,
  username: string
) => {
  try {
    // 1. get folder by id

    // 3. get full old path and create below new full path
    const oldPath = (await getFolderPathFromDB(username, id)) as string;

    // const newPath = path.join(path.dirname(oldPath), newFolderName);
    const newPath = PathHelper.changeFolderName(oldPath, newFolderName);

    const properOldPath = PathHelper.normalizeFolderName(oldPath);
    const properNewPath = PathHelper.normalizeFolderName(newPath);

    await updateFolderName(id, newFolderName);

    await replaceFilePath(properOldPath, properNewPath);
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    } else throw new CustomError("Internal Database Error", 500);
  }
};

export const updateFolderName = async (id: number, newFolderName: string) => {
  try {
    await prisma.folder.update({
      where: { id: id },
      data: { name: newFolderName },
    });
  } catch (err) {
    throw new CustomError("Database error while updating folder name", 500);
  }
};

export const getParentFolder = async (id: number) => {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: id },
      select: { parentFolder: { select: { id: true, name: true } } },
    });

    return folder ? folder.parentFolder : null;
  } catch (err) {
    throw new CustomError("Database error while fething parent folder", 500);
  }
};

export const deleteFolder = async (id: number) => {
  try {
    return await prisma.folder.delete({ where: { id: id } });
  } catch (err) {
    throw new CustomError("Database error while deleting folder", 500);
  }
};

// const getFullPathFolderDirectory = (username: string, parts: string[]) => {
//   const fullPath = path.join("files", username, ...parts);

//   return fullPath;
// };

export const getFolderPathFromDB = async (
  username: string,
  folderId: number
): Promise<string | undefined> => {
  try {
    let parts: string[] = [];
    let currentFolder = await getFolderById(folderId);

    while (currentFolder) {
      parts.unshift(currentFolder.name);

      if (!currentFolder.parentFolderId) break;
      currentFolder = await getFolderById(currentFolder.parentFolderId);
    }

    const fullPath = PathHelper.getFullPathFolderDirectory(username, parts);

    return fullPath;
  } catch (err) {
    if (err instanceof CustomError) throw err;
    else new CustomError("Database Internal Error", 500);
  }
};

export const removeCloudFolder = async (
  public_id: string,
  resource_type: string
) => {
  try {
    await cloudinary.uploader.destroy(public_id, {
      resource_type: resource_type,
    });
  } catch (error) {
    throw new CustomError("Failed to remove Cloudinary folder", 500);
  }
};

export const renameResourceFolder = async (
  oldPublicId: string,
  newPublicId: string,
  resourceType: string
) => {
  try {
    await cloudinary.uploader.rename(oldPublicId, newPublicId, {
      resource_type: resourceType,
      overwrite: true,
      invalidate: true,
    });
  } catch (error) {
    throw new CustomError("Failed to rename Cloudinary resource folder", 500);
  }
};

export const updateResourceAssetFolder = async (
  newPublicId: string,
  resourceType: string,
  assetFolder: string
) => {
  try {
    await cloudinary.api.update(newPublicId, {
      resource_type: resourceType,
      asset_folder: assetFolder,
    });
  } catch (error) {
    throw new CustomError(
      "Failed to update Cloudinary resource asset folder",
      500
    );
  }
};

export const deleteResourceFolder = async (path: string) => {
  try {
    await cloudinary.api.delete_folder(path);
  } catch (error) {
    throw new CustomError("Failed to delete Cloudinary resource folder", 500);
  }
};
