import { Request, Response } from "express";
import { User } from "@prisma/client";
import { HandlerType } from "../types/handlers";
import { validationResult } from "express-validator";
import { getValidationErrorMessages } from "../utils/errors/getValidationErrorMessages";
import { getFolderById, getUserFolders } from "../services/folder.service";
import { parseFolderId } from "../utils/helpers/parseFolderId";
import { URLLinkHelper } from "../utils/helpers/UrlLinkHelper";
// import { getParentLink } from "../utils/helpers/getParentLink";

export const handleFolderValidation: HandlerType = async (req, res, next) => {
  const user = req.user as User;
  const folderId = parseFolderId(req.params.folderId);
  const folderData = req.body;

  try {
    const errors = getValidationErrors(req);

    if (errors.length > 0) {
      await renderFolderWithErrors(res, {
        user,
        folderId,
        errors,
        folderData,
        action: req.originalUrl,
      });

      return;
    }

    next();
  } catch (err) {
    next(err);
  }
};

const getValidationErrors = (req: Request): string[] => {
  const errorResults = validationResult(req);

  return errorResults.isEmpty()
    ? []
    : getValidationErrorMessages(errorResults.array());
};

const renderFolderWithErrors = async (
  res: Response,
  {
    user,
    folderId,
    errors,
    folderData,
    action,
  }: {
    user: User;
    folderId: number | null;
    errors: string[];
    folderData: any;
    action: string;
  }
) => {
  if (!folderId) {
    const folders = await getUserFolders(user.id, folderId);
    console.log(folders);
    res.render("pages/folderList", {
      title: "folder list",
      user,
      folders,
      errors,
      data: folderData,
    });
  } else {
    const folder = await getFolderById(folderId);

    // const link = getParentLink(folder?.parentFolder);
    const link = URLLinkHelper.getFolderUrl(folder?.parentFolderId);

    res.render("pages/folderDetail", {
      title: "folder detail",
      user,
      folder,
      errors,
      data: folderData,
      backLink: link,
      action,
    });
  }
};
