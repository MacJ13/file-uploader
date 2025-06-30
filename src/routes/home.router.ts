import { Router } from "express";
import homeController from "../controllers/home.controller";

const homeRouter = Router();

homeRouter.get("/", homeController.get_homepage);

export default homeRouter;
