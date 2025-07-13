import { Router } from "express";
import userController from "../controllers/user.controller";
import { redirectIfGuest } from "../middlewares/redirectAuth";

const userRouter = Router();

userRouter.use(redirectIfGuest);

userRouter.get("/:userId", userController.get_user_homepage);

export default userRouter;
