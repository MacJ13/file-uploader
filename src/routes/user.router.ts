import { Router } from "express";
import userController from "../controllers/user.controller";
import { redirectIfGuest } from "../middlewares/redirectAuth";
import { changePasswordValidation } from "../middlewares/validators/authValidators";
import { handleValidation } from "../middlewares/handleValidation";

const userRouter = Router();

userRouter.use(redirectIfGuest);

userRouter.get("/dashboard", userController.get_user_dashboard);

userRouter.get("/settings", userController.get_user_settings);

userRouter.get("/password", userController.change_password_get);

userRouter.post(
  "/password",
  changePasswordValidation,
  handleValidation({
    view: "pages/changePasswordForm",
    title: "change password",
  }),
  userController.change_password_post
);
export default userRouter;
