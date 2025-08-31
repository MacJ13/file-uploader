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
// import { getRedirectUrlForFolder } from "../utils/helpers/getRedirectUrlForFolder";
import { splitFileName } from "../utils/helpers/splitFileName";
import axios from "axios";
import CustomError from "../utils/errors/CustomError";
import { URLLinkHelper } from "../utils/helpers/UrlLinkHelper";

const upload_file_post: HandlerType = async (req, res, next) => {
  try {
    const user = req.user as User;
    const folderId = req.body.folderId ? +req.body.folderId : null;
    const file = req.file;

    if (!file) throw new CustomError("File not found", 404);

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
  try {
    const files = await getUserFiles(+user.id);
    res.render("pages/fileList", {
      title: "file list",
      user: user,
      files: files,
    });
  } catch (err) {
    next(err);
  }
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

    // const redirectUrl = deletedFile.folderId
    //   ? getRedirectUrlForFolder(deletedFile.folderId)
    //   : "/file/all";

    const redirectUrl = URLLinkHelper.getRedirectUrl(deletedFile.folderId);
    console.log({ redirectUrl });
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

  try {
    await updateFile(fileId, title);

    res.redirect(`/file/${fileId}`);
  } catch (err) {
    next(err);
  }
};

const file_download_get: HandlerType = async (req, res, next) => {
  try {
    const fileID = +req.params.fileId;
    const file = await getFileById(fileID);

    if (!file) throw new CustomError("File not found", 404);

    const filePath = file.path as string;
    const fileName = file.name as string;

    // directed link to cloudinary file
    const fileUrl = await getFileUrl(filePath, file.type);

    // get file by streaming,
    const response = await axios.get(fileUrl, { responseType: "stream" });

    // direct client to Cloudinary immediately

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader(
      "Content-Type",
      response.headers["content-type"] || "application/octet-stream"
    );

    response.data.pipe(res);

    response.data.on("error", (err: any) =>
      next(new CustomError("Error while donwloading file from server", 500))
    );
    response.data.on("end", () => res.end());
    // res.redirect("/");
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
