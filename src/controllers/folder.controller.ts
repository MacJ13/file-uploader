import { HandlerType } from "../types/handlers";
import { User } from "../../generated/prisma";
import { createFolder, getUserFolders } from "../services/folder.service";
import { validationResult } from "express-validator";
import { getValidationErrorMessages } from "../utils/errors/getValidationErrorMessages";

const create_folder_get: HandlerType = (req, res, next) => {
  const user = req.user;

  res.render("pages/folderForm", { user: user, title: "create new folder" });
};

const create_folder_post: HandlerType = async (req, res, next) => {
  const { id: userId } = req.user as User;

  const { title } = req.body;

  try {
    await createFolder(title, userId);

    res.redirect("/user/dashboard");
  } catch (err) {
    next(err);
  }
};

const folder_list: HandlerType = async (req, res, next) => {
  const user = req.user as User;
  try {
    const folders = await getUserFolders(user.id);

    res.render("pages/folderList", {
      title: "folder list",
      user: user,
      folders: folders,
    });
  } catch (err) {
    next(err);
  }
};

const add_folder_in_list: HandlerType = async (req, res, next) => {
  const user = req.user as User;
  const folderId = req.params.folderId ? +req.params.folderId : null;

  const errorResults = validationResult(req);

  const folderData = req.body;

  try {
    if (!errorResults.isEmpty()) {
      const folders = await getUserFolders(user.id, folderId);
      const errors = getValidationErrorMessages(errorResults.array());
      res.render("pages/folderList", {
        title: "folder list",
        user: user,
        folders: folders,
        errors: errors,
        data: folderData,
        action: req.originalUrl,
      });
      return;
    }

    const folderTitle = folderData.title;

    await createFolder(folderTitle, user.id, folderId);
    console.log("folder is created in folder list");
    res.redirect(req.originalUrl);
  } catch (err) {
    next(err);
  }
};

export default {
  create_folder_get,
  create_folder_post,
  folder_list,
  add_folder_in_list,
};
