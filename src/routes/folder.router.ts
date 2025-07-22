import { Router } from "express";
import folderController from "../controllers/folder.controller";
import { redirectIfGuest } from "../middlewares/redirectAuth";

const folderRouter = Router();

folderRouter.use(redirectIfGuest);

folderRouter.get("/create", folderController.create_folder_get);

export default folderRouter;
