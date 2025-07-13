import { Router } from "express";
import authController from "../controllers/auth.controller";
import {
  loginValidation,
  registerValidation,
} from "../middlewares/validators/authValidators";
import { handleValidation } from "../middlewares/handleValidation";
import {
  redirectIfAuthenticated,
  redirectIfGuest,
} from "../middlewares/redirectAuth";

const authRouter = Router();

authRouter.get(
  "/register",
  redirectIfAuthenticated,
  authController.register_get
);

authRouter.post(
  "/register",
  redirectIfAuthenticated,
  registerValidation,
  handleValidation({ view: "pages/registerForm", title: "Register Form" }),
  authController.register_post
);

authRouter.get("/login", redirectIfAuthenticated, authController.login_get);

authRouter.post(
  "/login",
  redirectIfAuthenticated,
  loginValidation,
  handleValidation({ view: "pages/loginForm", title: "Register Form" }),
  authController.login_authenticate
);

authRouter.get("/logout", redirectIfGuest, authController.logout_get);

export default authRouter;
