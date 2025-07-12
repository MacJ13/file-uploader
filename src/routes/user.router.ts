import { Router } from "express";
import userController from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/:userId", userController.get_user_homepage);

export default userRouter;
