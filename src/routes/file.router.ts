import { Router } from "express";
import fileController from "../controllers/file.controller";
import { fileUpload } from "../config/multer.config";
import { redirectIfGuest } from "../middlewares/redirectAuth";

const fileRouter = Router();

fileRouter.use(redirectIfGuest);

fileRouter.get("/all", fileController.file_list);

fileRouter.post(
  "/upload",
  fileUpload.single("file"),
  fileController.upload_file_post
);

fileRouter.get("/:fileId/delete", fileController.file_delete_get);

export default fileRouter;
