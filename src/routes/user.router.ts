import { Router } from "express";
import userController from "../controllers/user.controller";
import { redirectIfGuest } from "../middlewares/redirectAuth";

const userRouter = Router();

userRouter.use(redirectIfGuest);

userRouter.get("/dashboard", userController.get_user_dashboard);

export default userRouter;
