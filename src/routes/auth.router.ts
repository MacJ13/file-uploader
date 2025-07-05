import { Router } from "express";
import authController from "../controllers/auth.controller";

const authRouter = Router();

authRouter.get("/register", authController.register_get);

export default authRouter;
