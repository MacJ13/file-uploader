import { HandlerType } from "../types/handlers";

const create_folder_get: HandlerType = (req, res, next) => {
  const user = req.user;

  res.render("pages/folderForm", { user: user, title: "create new folder" });
};

export default { create_folder_get };
