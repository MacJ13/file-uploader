import { Router } from "express";
import authController from "../controllers/auth.controller";
import { registerValidation } from "../middlewares/validators/authValidators";

const authRouter = Router();

authRouter.get("/register", authController.register_get);

authRouter.post("/register", registerValidation, authController.register_post);

export default authRouter;
