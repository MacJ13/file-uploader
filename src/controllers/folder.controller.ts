import { HandlerType } from "../types/handlers";
import { User } from "../../generated/prisma";
import {
  createFolder,
  deleteFolder,
  deleteResourceFolder,
  getFolderById,
  getFolderName,
  getFolderPathFromDB,
  getUserFolders,
  removeCloudFolder,
  renameResourceFolder,
  updateFolder,
  updateFolderVisitedDate,
  updateResourceAssetFolder,
} from "../services/folder.service";
import { getParentLink } from "../utils/helpers/getParentLink";
import { verifyUserPassword } from "../services/user.service";
import { getRedirectUrlForFolder } from "../utils/helpers/getRedirectUrlForFolder";
import { parseFolderId } from "../utils/helpers/parseFolderId";
import cloudinary from "../config/cloudinary.config";
import { normalizeFolderName } from "../utils/helpers/normalizeFolderName";
import {
  getFileResources,
  getFileResourcesByPath,
} from "../services/file.service";
import { getDirectoryPath } from "../utils/helpers/getDirectoryPath";
import { replaceSubstring } from "../utils/helpers/replaceSubstring";

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
  const user = req.user as User;
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
  try {
    const user = req.user as User;
    const folderId = +req.params.folderId;

    const title = req.body.title;
    const newProperTitle = normalizeFolderName(title);

    const folderName = await getFolderName(+folderId);
    const properFolderName = normalizeFolderName(folderName);

    const folderPath = (await getFolderPathFromDB(
      user.username,
      +folderId
    )) as string;
    // const newFolderPath = replaceSubstring(folderPath, folderName, title);

    const properPath = normalizeFolderName(folderPath);
    // const newProperPath = normalizeFolderName(newFolderPath);

    const allFiles = await getFileResourcesByPath(properPath);

    for (const file of allFiles) {
      const oldPublicId = file.public_id as string;

      const fileFolderDirectory = getDirectoryPath(oldPublicId);

      const fileType = file.resource_type;

      const newPublicId = replaceSubstring(
        oldPublicId,
        properFolderName,
        newProperTitle
      );

      const newFileFolderDirectory = replaceSubstring(
        fileFolderDirectory,
        properFolderName,
        newProperTitle
      );

      await renameResourceFolder(oldPublicId, newPublicId, fileType);

      await updateResourceAssetFolder(
        newPublicId,
        fileType,
        newFileFolderDirectory
      );
    }

    await deleteResourceFolder(properPath);

    // // 4. update folder title in db
    await updateFolder(title, folderId, user.username);

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
    const path = (await getFolderPathFromDB(
      user.username,
      +folderId
    )) as string;

    const properPath = normalizeFolderName(path);

    const fileResources = await getFileResources(properPath);

    let folderPaths = [];

    for (const file of fileResources) {
      const properPath = getDirectoryPath(file.public_id);

      // let path = file.public_id.split("/");
      // path.pop();

      // const properPath = path.join("/");

      if (folderPaths.indexOf(properPath) < 0) {
        folderPaths.unshift(properPath);
      }

      await removeCloudFolder(file.public_id, file.resource_type);
    }

    folderPaths.forEach(async (path) => {
      await cloudinary.api.delete_folder(path);
    });

    // console.log(result);
    // if (fsSync.existsSync(path)) {
    //   await fs.rmdir(path, { recursive: true });
    // }

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

// const folder_update_post: HandlerType = async (req, res, next) => {
//   try {
//     const user = req.user as User;
//     const folderId = +req.params.folderId;

//     const title = req.body.title;
//     const newProperTitle = normalizeFolderName(title);

//     const folderName = await getFolderName(+folderId);
//     const properFolderName = normalizeFolderName(folderName);

//     const folderPath = await getFolderPathFromDB(user.username, +folderId);
//     const newFolderPath = replaceSubstring(folderPath, folderName, title);

//     const properPath = normalizeFolderName(folderPath);
//     const newProperPath = normalizeFolderName(newFolderPath);

//     // console.log({
//     //   folderName,
//     //   folderPath,
//     //   properPath,
//     //   newProperPath,
//     //   newProperTitle,
//     // });

//     //  // get file resources from old proper path

//     // const resourceTypes: FileResourceType[] = ["image", "video", "raw"];

//     // const allFiles = [];

//     // for (const type of resourceTypes) {
//     //   let nextCursor: string | undefined = undefined;

//     //   do {
//     //     const response = await cloudinary.api.resources({
//     //       type: "upload",
//     //       prefix: properPath,
//     //       resource_type: type,
//     //       max_results: 500, // maximum number results per page
//     //       next_cursor: nextCursor,
//     //     });

//     //     allFiles.unshift(...response.resources);
//     //     nextCursor = response.next_cursor;
//     //   } while (nextCursor);

//     //   console.log(allFiles);
//     // }

//     const allFiles = await getFileResourcesByPath(properPath);

//     console.log(allFiles);

//     for (const file of allFiles) {
//       const oldPublicId = file.public_id as string;

//       // const filePath = oldPublicId.split("/");

//       // const fileName = filePath.pop();

//       const fileFolderDirectory = getDirectoryPath(oldPublicId);

//       const fileType = file.resource_type;

//       const newPublicId = replaceSubstring(
//         oldPublicId,
//         properFolderName,
//         newProperTitle
//       );

//       const newFileFolderDirectory = replaceSubstring(
//         fileFolderDirectory,
//         properFolderName,
//         newProperTitle
//       );

//       // const newPublicId = oldPublicId.replace(properFolderName, newProperTitle);

//       // const newFileFolderDirectory = fileFolderDirectory.replace(
//       //   properFolderName,
//       //   newProperTitle
//       // );

//       // console.log({
//       //   fileName,
//       //   fileFolderDirectory,
//       //   newFileFolderDirectory,
//       //   oldPublicId,
//       //   newPublicId,
//       //   fileType,
//       // });

//       // rename file public _id

//       await renameResourceFolder(oldPublicId, newPublicId, fileType);
//       // const renamedPublicIdResult = await cloudinary.uploader.rename(
//       //   oldPublicId,
//       //   newPublicId,
//       //   {
//       //     resource_type: fileType,
//       //     overwrite: true,
//       //     invalidate: true,
//       //   }
//       // );

//       // console.log({ renamedPublicIdResult });

//       // // update asset folder with new public_id
//       await updateResourceAssetFolder(
//         newPublicId,
//         fileType,
//         newFileFolderDirectory
//       );
//       // const updateFolderResultAsset = await cloudinary.api.update(newPublicId, {
//       //   resource_type: fileType,
//       //   asset_folder: newFileFolderDirectory,
//       // });

//       // console.log({ updateFolderResultAsset });

//       // // get new file from new public id
//       // const newResource = await cloudinary.api.resource(newPublicId, {
//       //   resource_type: fileType,
//       // });

//       // console.log({ newResource });
//     }

//     await deleteResourceFolder(properPath);

//     // const deletedOldResource = await cloudinary.api.delete_folder(properPath);

//     // console.log({ deletedOldResource });

//     // // 2. update folder title in db
//     await updateFolder(title, folderId, user.username);
//     // const fileResources = await getFileResourcesByPath(newProperPath);
//     res.redirect(`/folder/${folderId}`);
//     // console.log({ fileResources });
//   } catch (err) {
//     console.log(err);
//     res.redirect("/");
//   }

//   // try {
//   //   // get resource with public_id
//   //   // const resource = await cloudinary.api.resource(
//   //   //   "files/user12/newfolder/pass/mapy",
//   //   //   {
//   //   //     resource_type: "raw",
//   //   //   }
//   //   // );
//   //   // console.log({ resource });

//   //   // // rename public id
//   //   // const result = await cloudinary.uploader.rename(
//   //   //   "files/user12/newfolder/pass/mapy",
//   //   //   "files/user12/new_updated_folder/pass/mapy",
//   //   //   { resource_type: "raw", overwrite: true, invalidate: true }
//   //   // );

//   //   // console.log({ result });

//   //   // // update asset folder in with new public.id
//   //   // const resultAsset = await cloudinary.api.update(
//   //   //   "files/user12/new_updated_folder/pass/mapy",
//   //   //   {
//   //   //     resource_type: "raw",
//   //   //     asset_folder: "files/user12/new_updated_folder/pass", // <-- to zmienia folder w Media Library
//   //   //   }
//   //   // );

//   //   // console.log(resultAsset);
//   //   // // get new resource
//   //   // const newResource = await cloudinary.api.resource(
//   //   //   "/files/user12/new_updated_folder/pass/mapy",
//   //   //   {
//   //   //     resource_type: "raw",
//   //   //   }
//   //   // );

//   //   // console.log({ newResource });

//   //   // // remove old directory with assets

//   //   // const resultDel = await cloudinary.api.delete_folder(
//   //   //   "files/user12/newfolder/"
//   //   // );

//   //   // console.log({ resultDel });

//   //   // const oldResource = await cloudinary.api.resource(
//   //   //   "/files/user12/newfolder/pass/mapy",
//   //   //   {
//   //   //     resource_type: "raw",
//   //   //   }
//   //   // );

//   //   // console.log({ oldResource });
//   //   res.redirect("/");
//   // } catch (err) {
//   //   console.error("Full error:", JSON.stringify(err, null, 2));
//   //   res.redirect("/");
//   // }
//   // try {
//   //   // 1. get folderId and  title from form filed of reques
//   //   const user = req.user as User;
//   //   const title = req.body.title;
//   //   const folderId = +req.params.folderId;

//   //   const folderName = (await getFolderName(+folderId)) as string;

//   //   const path = await getFolderPathFromDB(user.username, folderId);

//   //   const folderPath = await getFolderPathFromDB(user.username, +folderId);

//   //   const properPath = normalizeFolderName(folderPath as string);

//   //   const newProperPath = normalizeFolderName(
//   //     properPath.replace(folderName as string, title)
//   //   );

//   //   const properTitle = normalizeFolderName(title);

//   //   // console.log({ properPath, newProperPath });
//   //   // const fileResources = await getFileResources(properPath);

//   //   // console.log({ fileResources });

//   //   const resourceTypes: ("image" | "video" | "raw")[] = [
//   //     "image",
//   //     "video",
//   //     "raw",
//   //   ];

//   //   const allFiles: any[] = [];

//   //   for (const type of resourceTypes) {
//   //     let nextCursor: string | undefined = undefined;

//   //     do {
//   //       const response = await cloudinary.api.resources({
//   //         type: "upload",
//   //         prefix: properPath,
//   //         resource_type: type,
//   //         max_results: 500, // maksymalna liczba wyników na stronę
//   //         next_cursor: nextCursor,
//   //       });

//   //       allFiles.unshift(...response.resources);
//   //       nextCursor = response.next_cursor;
//   //     } while (nextCursor);
//   //   }

//   //   console.log(allFiles);

//   //   for (const resource of allFiles) {
//   //     const oldPublicId = resource.public_id as string;
//   //     console.log({ oldPublicId });
//   //     const fileName = oldPublicId.split("/").pop();
//   //     console.log(fileName);

//   //     const newPublicId = oldPublicId.replace(folderName, properTitle);
//   //     console.log({ newPublicId });

//   //     // await cloudinary.uploader.explicit(oldPublicId, {
//   //     //   type: "upload",
//   //     //   public_id: newPublicId,
//   //     //   overwrite: true,
//   //     // });

//   //     await cloudinary.uploader.upload(resource.secure_url, {
//   //       public_id: newPublicId,
//   //       overwrite: true,
//   //       resource_type: resource.resource_type,
//   //     });

//   //     // await cloudinary.uploader.rename(oldPublicId, newPublicId);
//   //   }

//   //   // await cloudinary.api.delete_resources(allFiles.map((f) => f.public_id));

//   //   // await cloudinary.api.delete_folder(properPath);

//   //   // await cloudinary.api.delete_folder(properPath);

//   //   // 2. update folder title in db
//   //   await updateFolder(title, folderId, user.username);
//   //   // 3. redirect to given specific folder
//   //   res.redirect(`/folder/${folderId}`);
//   // } catch (err) {
//   //   console.log(err);
//   //   next(err);
//   // }
// };
