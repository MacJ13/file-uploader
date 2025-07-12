import { Router } from "express";
import authController from "../controllers/auth.controller";
import {
  loginValidation,
  registerValidation,
} from "../middlewares/validators/authValidators";

const authRouter = Router();

authRouter.get("/register", authController.register_get);

authRouter.post("/register", registerValidation, authController.register_post);

authRouter.get("/login", authController.login_get);

authRouter.post(
  "/login",
  loginValidation,
  authController.login_post,
  authController.login_authenticate
);

export default authRouter;
