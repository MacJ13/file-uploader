import { Router } from "express";
import authController from "../controllers/auth.controller";
import {
  loginValidation,
  registerValidation,
} from "../middlewares/validators/authValidators";
import { handleValidation } from "../middlewares/handleValidation";

const authRouter = Router();

authRouter.get("/register", authController.register_get);

authRouter.post(
  "/register",
  registerValidation,
  handleValidation({ view: "pages/registerForm", title: "Register Form" }),
  authController.register_post
);

authRouter.get("/login", authController.login_get);

authRouter.post(
  "/login",
  loginValidation,
  handleValidation({ view: "pages/loginForm", title: "Register Form" }),
  authController.login_authenticate
);

export default authRouter;
