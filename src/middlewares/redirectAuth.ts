import { User } from "../../generated/prisma";
import { HandlerType } from "../types/handlers";

export const redirectIfAuthenticated: HandlerType = (req, res, next) => {
  const user = req.user;

  if (user) {
    res.redirect(`/user/dashboard`);
    return;
  }

  next();
};

export const redirectIfGuest: HandlerType = (req, res, next) => {
  const user = req.user;

  if (!user) {
    res.redirect("/auth/login");
    return;
  }

  next();
};
