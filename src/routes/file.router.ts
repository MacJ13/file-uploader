import { Router } from "express";
import fileController from "../controllers/file.controller";
import { fileUpload } from "../config/multer.config";
import { redirectIfGuest } from "../middlewares/redirectAuth";

const fileRouter = Router();

fileRouter.use(redirectIfGuest);

fileRouter.post(
  "/upload",
  fileUpload.single("file"),
  fileController.upload_file_post
);

export default fileRouter;
