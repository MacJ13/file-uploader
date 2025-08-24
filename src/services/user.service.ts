import brcypt from "bcrypt";
import prisma from "../config/prisma.config";

type User = { username: string; email: string; password: string };

const generateHashPassword = (password: string) => {
  const salt = brcypt.genSaltSync(10);
  const hash = brcypt.hashSync(password, salt);

  return hash;
};

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
  const hash = generateHashPassword(user.password);

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
      take: 5,
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

export const changeUserPassword = async (id: number, password: string) => {
  // generate hash
  const hash = generateHashPassword(password);

  // modify user password
  const pass = await prisma.user.update({
    where: { id: id },
    data: {
      password: hash,
    },
  });
};
