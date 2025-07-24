import prisma from "../config/prisma.config";

export const createFolder = async (
  title: string,
  userId: number,
  parentFolderId?: number
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
  parentFolderId?: number
) => {
  const folders = await prisma.folder.findMany({
    where: { userId: userId, parentFolderId: parentFolderId ?? null },
    select: { id: true, name: true, parentFolderId: true, created_at: true },
    orderBy: { created_at: "desc" },
  });

  return folders;
};
