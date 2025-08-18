import { Router } from "express";
import userController from "../controllers/user.controller";
import { redirectIfGuest } from "../middlewares/redirectAuth";

const userRouter = Router();

userRouter.use(redirectIfGuest);

userRouter.get("/dashboard", userController.get_user_dashboard);

userRouter.get("/settings", userController.get_user_settings);

userRouter.get("/password", userController.change_password_get);

export default userRouter;
