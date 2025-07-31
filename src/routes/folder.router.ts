import { Router } from "express";
import folderController from "../controllers/folder.controller";
import { redirectIfGuest } from "../middlewares/redirectAuth";
import { folderValidation } from "../middlewares/validators/folderValidators";
import { handleValidation } from "../middlewares/handleValidation";

const folderRouter = Router();

folderRouter.use(redirectIfGuest);

folderRouter.get("/create", folderController.create_folder_get);

folderRouter.post(
  "/create",
  folderValidation,
  handleValidation({ view: "pages/folderForm", title: "Create new account" }),
  folderController.create_folder_post
);

folderRouter.get("/all", folderController.folder_list);

folderRouter.post(
  "/:folderId",
  folderValidation,
  folderController.add_folder_in_list
);

folderRouter.post(
  "/all",
  folderValidation,
  folderController.add_folder_in_list
);

folderRouter.get("/:folderId", folderController.folder_detail_get);

folderRouter.get("/:folderId/update", folderController.folder_update_get);

export default folderRouter;
