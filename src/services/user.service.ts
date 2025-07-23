import brcypt from "bcrypt";
import prisma from "../config/prisma.config";

type User = { username: string; email: string; password: string };

export const findUserByName = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  return user;
};

export const findUserById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  return user;
};

export const findUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  return user;
};

export const saveUser = async (user: User) => {
  // 1. generate a salt and hash password
  const salt = brcypt.genSaltSync(10);
  const hash = brcypt.hashSync(user.password, salt);

  //2 . create user with prsima
  await prisma.user.create({
    data: {
      username: user.username,
      email: user.email,
      password: hash,
    },
  });
};

export const getDashboardItems = async (userId: number) => {
  const [files, folders] = await Promise.all([
    await prisma.file.findMany({
      where: { userId: userId },
      select: {
        name: true,
        id: true,
        created_at: true,
        folder: { select: { name: true } },
      },
      orderBy: [{ created_at: "desc" }],
      take: 7,
    }),
    await prisma.folder.findMany({
      where: { userId: userId },
      select: {
        id: true,
        name: true,
        parentFolder: true,
      },
      orderBy: {
        visited_at: "desc",
      },
      take: 5,
    }),
  ]);

  return [folders, files];
};

export const verifyUserPassword = (
  password: string,
  hash: string
): Promise<boolean> => {
  const match = brcypt.compare(password, hash);

  return match;
};
