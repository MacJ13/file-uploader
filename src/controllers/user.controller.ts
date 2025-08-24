import { User } from "../../generated/prisma";
import {
  changeUserPassword,
  getDashboardItems,
} from "../services/user.service";
import { HandlerType } from "../types/handlers";

const get_user_dashboard: HandlerType = async (req, res, next) => {
  // console.log(req.user);
  // 1. get user data
  const user = req.user as User;

  try {
    // 2. get files and folders
    const [folders, files] = await getDashboardItems(user.id);
    res.render("pages/userDashboard", {
      title: "User Dashboard",
      user: user,
      folders: folders,
      files: files,
    });
  } catch (err) {
    next(err);
  }
};

const get_user_settings: HandlerType = async (req, res, next) => {
  const user = req.user as User;

  res.render("pages/userSettings", {
    title: "user settings",
    user: user,
  });
};

const change_password_get: HandlerType = async (req, res, next) => {
  const user = req.user as User;

  res.render("pages/changePasswordForm", {
    title: "change password",
    user: user,
  });
};

const change_password_post: HandlerType = async (req, res, next) => {
  const user = req.user as User;
  const formPassword = req.body.password;

  await changeUserPassword(user.id, formPassword);

  res.redirect("/user/settings");
};

const user_delete_get: HandlerType = async (req, res, next) => {
  const user = req.user as User;

  res.render("pages/deleteForm", {
    title: "delete user",
    user: user,
    action: "/user/delete",
  });
};

export default {
  get_user_dashboard,
  get_user_settings,
  change_password_get,
  change_password_post,
  user_delete_get,
};
