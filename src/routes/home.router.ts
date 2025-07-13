import { Router } from "express";
import homeController from "../controllers/home.controller";
import { redirectIfAuthenticated } from "../middlewares/redirectAuth";

const homeRouter = Router();

homeRouter.get("/", redirectIfAuthenticated, homeController.get_homepage);

export default homeRouter;
