import { HandlerType } from "../types/handlers";
import { User } from "../../generated/prisma";
import {
  createFolder,
  deleteFolder,
  getFolderById,
  getFolderName,
  getUserFolders,
  updateFolderName,
  updateFolderVisitedDate,
} from "../services/folder.service";
import { getParentLink } from "../utils/helpers/getParentLink";
import { verifyUserPassword } from "../services/user.service";
import { getRedirectUrlForFolder } from "../utils/helpers/getRedirectUrlForFolder";
import { parseFolderId } from "../utils/helpers/parseFolderId";

const create_folder_get: HandlerType = (req, res, next) => {
  const user = req.user;

  res.render("pages/folderForm", { user: user, title: "create new folder" });
};

const create_folder_post: HandlerType = async (req, res, next) => {
  const { id: userId } = req.user as User;

  const { title } = req.body;

  try {
    await createFolder(title, userId);

    res.redirect("/folder/all");
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
  const folderId = parseFolderId(req.params.folderId);

  const folderData = req.body;

  try {
    const folderTitle = folderData.title;

    await createFolder(folderTitle, user.id, folderId);
    res.redirect(req.originalUrl);
  } catch (err) {
    next(err);
  }
};

const folder_detail_get: HandlerType = async (req, res, next) => {
  try {
    const user = req.user;
    const { folderId } = req.params;

    const formAction = req.originalUrl;

    const folder = await getFolderById(+folderId);

    if (folder) {
      await updateFolderVisitedDate(+folderId);
    }

    const link = getParentLink(folder?.parentFolder);
    // console.log(folder);
    res.render("pages/folderDetail", {
      user: user,
      folder: folder,
      title: "folder detail",
      folders: folder?.subfolders,
      files: folder?.files,
      backLink: link,
      action: formAction,
    });
  } catch (err) {
    next(err);
  }
};

const folder_update_get: HandlerType = async (req, res, next) => {
  const user = req.user;
  const folderId = req.params.folderId;

  const folderName = await getFolderName(+folderId);

  const data = { title: folderName };

  res.render("pages/folderForm", {
    user: user,
    title: "update folder",
    data,
  });
};

const folder_update_post: HandlerType = async (req, res, next) => {
  // 1. get folderId and  title from form filed of reques
  const title = req.body.title;
  const folderId = +req.params.folderId;

  try {
    // 2. update folder title in db
    await updateFolderName(title, folderId);
    // 3. redirect to given specific folder
    res.redirect(`/folder/${folderId}`);
  } catch (err) {
    next(err);
  }
};

const folder_delete_get: HandlerType = async (req, res, next) => {
  const user = req.user;

  res.render("pages/deleteForm", {
    user: user,
    title: "Delete folder",
    action: req.originalUrl,
  });
};

const folder_delete_post: HandlerType = async (req, res, next) => {
  const folderId = req.params.folderId;

  const password = req.body.password;
  const user = req.user as User;

  try {
    const correctPassword = await verifyUserPassword(password, user.password);

    if (!correctPassword) {
      res.render("pages/deleteForm", {
        user: user,
        title: "Delete Folder",
        data: { password: password },
        errors: ["user password is incorrect"],
        action: req.originalUrl,
      });
      return;
    }

    const deletedFolder = await deleteFolder(+folderId);

    const redirectUrl = getRedirectUrlForFolder(deletedFolder.parentFolderId);

    res.redirect(redirectUrl);
  } catch (err) {
    next(err);
  }
};

export default {
  create_folder_get,
  create_folder_post,
  folder_list,
  add_folder_in_list,
  folder_detail_get,
  folder_update_get,
  folder_update_post,
  folder_delete_get,
  folder_delete_post,
};
