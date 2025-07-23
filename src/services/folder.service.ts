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
