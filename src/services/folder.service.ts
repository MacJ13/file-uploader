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
  parentFolderId?: number | null
) => {
  const folders = await prisma.folder.findMany({
    where: { userId: userId, parentFolderId: parentFolderId },
    select: { id: true, name: true, parentFolderId: true, created_at: true },
    orderBy: { created_at: "desc" },
  });

  return folders;
};
