import brcypt from "bcrypt";
import prisma from "../config/prisma.config";
import CustomError from "../utils/errors/CustomError";

type User = { username: string; email: string; password: string };

const generateHashPassword = (password: string) => {
  const salt = brcypt.genSaltSync(10);
  const hash = brcypt.hashSync(password, salt);

  return hash;
};

export const findUserByName = async (username: string) => {
  try {
  } catch (err) {
    throw new CustomError(
      "Database error while fetching user data by name",
      500
    );
  }
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  return user;
};

export const findUserById = async (id: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    return user;
  } catch (err) {
    throw new CustomError("Database error while fetching user data by id", 500);
  }
};

export const findUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    return user;
  } catch (err) {
    throw new CustomError(
      "Database error while fetching user data by email",
      500
    );
  }
};

export const saveUser = async (user: User) => {
  try {
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
  } catch (err) {
    throw new CustomError("Database error while creating user", 500);
  }
};

export const deleteUser = async (userId: number) => {
  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch (err) {
    console.log(err);
    throw new CustomError("Database error white deleting user", 500);
  }
};

export const getDashboardItems = async (userId: number) => {
  try {
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
  } catch (err) {
    throw new CustomError("Database error while fetching dashboard items", 500);
  }
};

export const verifyUserPassword = (
  password: string,
  hash: string
): Promise<boolean> => {
  const match = brcypt.compare(password, hash);

  return match;
};

export const changeUserPassword = async (id: number, password: string) => {
  try {
    // generate hash
    const hash = generateHashPassword(password);

    // modify user password
    await prisma.user.update({
      where: { id: id },
      data: {
        password: hash,
      },
    });
  } catch (err) {
    throw new CustomError("Database error while changing user password", 500);
  }
};
