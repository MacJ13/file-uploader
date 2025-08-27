import path from "path";
import { User } from "../../generated/prisma";
import {
  deletePhysicalFile,
  getFileResourcesByPath,
} from "../services/file.service";
import {
  changeUserPassword,
  deleteUser,
  getDashboardItems,
  verifyUserPassword,
} from "../services/user.service";
import { HandlerType } from "../types/handlers";
import { normalizeFolderName } from "../utils/helpers/normalizeFolderName";
import { deleteResourceFolder } from "../services/folder.service";

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
  try {
    const user = req.user as User;
    const formPassword = req.body.password;

    await changeUserPassword(user.id, formPassword);

    res.redirect("/user/settings");
  } catch (err) {
    next(err);
  }
};

const user_delete_get: HandlerType = async (req, res, next) => {
  const user = req.user as User;

  res.render("pages/deleteForm", {
    title: "delete user",
    user: user,
    action: "/user/delete",
  });
};

const user_delete_post: HandlerType = async (req, res, next) => {
  const user = req.user as User;

  const password = req.body.password;

  try {
    const correctPassword = await verifyUserPassword(password, user.password);

    if (!correctPassword) {
      res.render("pages/deleteForm", {
        user: user,
        title: "delete user",
        errors: ["user password is incorrect"],
        action: req.originalUrl,
      });
      return;
    }

    const mainUserPath = normalizeFolderName(path.join("files", user.username));

    const resourcesFiles = await getFileResourcesByPath(mainUserPath);

    if (resourcesFiles.length) {
      for (const file of resourcesFiles) {
        const filePublicId = file.public_id;
        const fileResourceType = file.resource_type;

        await deletePhysicalFile(filePublicId, fileResourceType);
      }
      await deleteResourceFolder(mainUserPath);
    }

    await deleteUser(user.id);

    req.logOut((err) => {
      if (err) return next(err);

      req.session.destroy((err) => {
        if (err) return next(err);

        res.clearCookie("connect.sid");
        res.redirect("/");
      });
    });
  } catch (err) {
    next(err);
  }
};

export default {
  get_user_dashboard,
  get_user_settings,
  change_password_get,
  change_password_post,
  user_delete_get,
  user_delete_post,
};
