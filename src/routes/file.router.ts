import { Router } from "express";
import fileController from "../controllers/file.controller";
import { fileUpload } from "../config/multer.config";
import { redirectIfGuest } from "../middlewares/redirectAuth";
import { passwordValidation } from "../middlewares/validators/authValidators";
import { handleValidation } from "../middlewares/handleValidation";

const fileRouter = Router();

fileRouter.use(redirectIfGuest);

fileRouter.get("/all", fileController.file_list);

fileRouter.get("/:fileId", fileController.file_detail);

fileRouter.post(
  "/upload",
  fileUpload.single("file"),
  fileController.upload_file_post
);

fileRouter.get("/:fileId/delete", fileController.file_delete_get);

fileRouter.post(
  "/:fileId/delete",
  passwordValidation,
  handleValidation({ view: "pages/deleteForm", title: "Delete file" }),
  fileController.file_delete_post
);

export default fileRouter;
