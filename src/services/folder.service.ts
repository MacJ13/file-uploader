import prisma from "../config/prisma.config";

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

export const updateFolderName = async (folderName: string, id: number) => {
  await prisma.folder.update({
    where: { id: id },
    data: { name: folderName },
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
