import { Router } from "express";
import folderController from "../controllers/folder.controller";
import { redirectIfGuest } from "../middlewares/redirectAuth";
import { itemValidation } from "../middlewares/validators/itemValidators";
import { handleValidation } from "../middlewares/handleValidation";
import { passwordValidation } from "../middlewares/validators/authValidators";
import { handleFolderValidation } from "../middlewares/handleFolderValidation";

const folderRouter = Router();

folderRouter.use(redirectIfGuest);

folderRouter.get("/create", folderController.create_folder_get);

folderRouter.post(
  "/create",
  itemValidation,
  handleValidation({ view: "pages/folderForm", title: "Create new folder" }),
  folderController.create_folder_post
);

folderRouter.get("/all", folderController.folder_list);

folderRouter.post(
  "/:folderId",
  itemValidation,
  handleFolderValidation,
  folderController.add_folder_in_list
);

folderRouter.post("/all", itemValidation, folderController.add_folder_in_list);

folderRouter.get("/:folderId", folderController.folder_detail_get);

folderRouter.get("/:folderId/update", folderController.folder_update_get);

folderRouter.post(
  "/:folderId/update",
  itemValidation,
  handleValidation({ view: "pages/folderForm", title: "Update Folder" }),
  folderController.folder_update_post
);

folderRouter.get("/:folderId/delete", folderController.folder_delete_get);

folderRouter.post(
  "/:folderId/delete",
  passwordValidation,
  handleValidation({ view: "pages/deleteForm", title: "Delete folder" }),
  folderController.folder_delete_post
);

export default folderRouter;
