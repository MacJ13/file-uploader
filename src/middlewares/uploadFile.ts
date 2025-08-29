import { MulterError } from "multer";
import { fileUpload } from "../config/multer.config";
import { HandlerType } from "../types/handlers";
import CustomError from "../utils/errors/CustomError";

export const uploadFile: HandlerType = (req, res, next) => {
  fileUpload.single("file")(req, res, (err: any) => {
    if (err) {
      if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE") {
        next(new CustomError("File too large. Max 4 MB allowed", 400));
        return;
      }
      next(new CustomError("Failed to upload file", 500));
    } else next();
  });
};
