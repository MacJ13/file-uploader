import { HandlerType } from "../types/handlers";
import { User } from "../../generated/prisma";
import { createFolder } from "../services/folder.service";

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

export default { create_folder_get, create_folder_post };
