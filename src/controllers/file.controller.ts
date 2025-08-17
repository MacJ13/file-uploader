import { UploadApiResponse } from "cloudinary";
import { User } from "../../generated/prisma";
import {
  deleteFileWithPhysicalRemove,
  getFileById,
  getFileUrl,
  getUserFiles,
  resolveUploadPath,
  saveFileToDB,
  updateFile,
  uploadFileStream,
} from "../services/file.service";
import { verifyUserPassword } from "../services/user.service";
import { HandlerType } from "../types/handlers";
import { getRedirectUrlForFolder } from "../utils/helpers/getRedirectUrlForFolder";
import { splitFileName } from "../utils/helpers/splitFileName";
import cloudinary from "../config/cloudinary.config";

const upload_file_post: HandlerType = async (req, res, next) => {
  try {
    const user = req.user as User;
    const folderId = req.body.folderId ? +req.body.folderId : null;
    const file = req.file;

    if (!file) throw new Error();

    const folderName = await resolveUploadPath(user.username, folderId);

    const fileResult = await uploadFileStream(folderName, file);

    const { public_id, resource_type } = fileResult as UploadApiResponse;

    const { originalname, size } = file;

    const fileCreation = {
      public_id,
      resource_type,
      originalname,
      size,
      folderId,
      userId: user.id,
    };

    await saveFileToDB(fileCreation);

    let redirectURL = "/file/all";
    if (folderId) {
      redirectURL = `/folder/${folderId}`;
    }

    return res.redirect(redirectURL);
  } catch (err) {
    next(err);
  }
};

const file_detail: HandlerType = async (req, res, next) => {
  // 1. get user from req. user
  const user = req.user as User;
  // 2. get folderId parameter
  const fileId = +req.params.fileId;

  try {
    const file = await getFileById(fileId);

    res.render("pages/fileDetail", {
      user: user,
      file: file,
      title: `${file?.name} file detail`,
    });
  } catch (err) {
    next(err);
  }
};

const file_list: HandlerType = async (req, res, next) => {
  const user = req.user as User;

  const files = await getUserFiles(+user.id);
  res.render("pages/fileList", {
    title: "file list",
    user: user,
    files: files,
  });
};

const file_delete_get: HandlerType = async (req, res, next) => {
  const user = req.user;
  res.render("pages/deleteForm", {
    user: user,
    title: "Delete file",
    action: req.originalUrl,
  });
};

const file_delete_post: HandlerType = async (req, res, next) => {
  const fileId = +req.params.fileId;

  const password = req.body.password;
  const user = req.user as User;

  try {
    const correctPassword = await verifyUserPassword(password, user.password);

    if (!correctPassword) {
      res.render("pages/deleteForm", {
        user: user,
        title: "Delete File",
        errors: ["user password is incorrect"],
        action: req.originalUrl,
      });
      return;
    }

    const deletedFile = await deleteFileWithPhysicalRemove(fileId);

    const redirectUrl = deletedFile.folderId
      ? getRedirectUrlForFolder(deletedFile.folderId)
      : "/file/all";

    res.redirect(redirectUrl);
  } catch (err) {
    next(err);
  }
};

const file_update_get: HandlerType = async (req, res, next) => {
  const user = req.user as User;
  const fileId = +req.params.fileId;

  try {
    const file = await getFileById(fileId);

    const { fileName } = splitFileName(file?.name as string);

    res.render("pages/fileForm", {
      user: user,
      title: "upload file",
      file: file,
      data: { title: fileName, path: file?.path },
      action: req.originalUrl,
    });
  } catch (err) {
    next(err);
  }
};

const file_update_post: HandlerType = async (req, res, next) => {
  const fileId = +req.params.fileId;

  const { title } = req.body;

  await updateFile(fileId, title);

  res.redirect(`/file/${fileId}`);
};

const file_download_get: HandlerType = async (req, res, next) => {
  // get fileId from params
  const fileID = +req.params.fileId;

  try {
    const file = await getFileById(fileID);

    const filePath = file?.path as string;

    const fileUrl = await getFileUrl(filePath);

    res.redirect("/");
    res.download(fileUrl);
  } catch (err) {
    next(err);
  }
};

export default {
  upload_file_post,
  file_detail,
  file_list,
  file_delete_get,
  file_delete_post,
  file_update_get,
  file_update_post,
  file_download_get,
};

//
// id
// name: originalName,
// path: path
// size: size
// type : mimetype
// userId: user.id
// folder: folder.id

// [1] {
// [1]   fieldname: 'file',
// [1]   originalname: 'image.jpg',
// [1]   encoding: '7bit',
// [1]   mimetype: 'image/jpeg',
// [1]   destination: 'public\\files\\user12\\update innder folder',
// [1]   filename: 'image.jpg',
// [1]   path: 'public\\files\\user12\\update innder folder\\image.jpg',
// [1]   size: 39987
// [1] }
