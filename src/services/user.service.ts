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
