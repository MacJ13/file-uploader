import { validationResult } from "express-validator";
import { HandlerType } from "../types/handlers";
import { saveUser } from "../services/user.service";

import { getValidationErrorMessages } from "../utils/errors/getValidationErrorMessages";
import { createErrorMessageArray } from "../utils/errors/createErrorMessageArray";
import { authenticateLocal, loginUser } from "../services/auth.service";

const register_get: HandlerType = (req, res, next) => {
  res.render("pages/registerForm", { title: "Register form" });
};

const register_post: HandlerType = async (req, res, next) => {
  const userData = req.body;

  try {
    const { confirm, ...restUserData } = userData;
    // 4. save user in db

    await saveUser(restUserData);
    res.redirect("/auth/login");
  } catch (err) {
    next(err);
  }
};

const login_get: HandlerType = async (req, res, next) => {
  res.render("pages/loginForm", { title: "Login form" });
};

const login_authenticate: HandlerType = async (req, res, next) => {
  try {
    const { user, info } = await authenticateLocal(req, res, next);

    if (!user) {
      const errorMessages = createErrorMessageArray(info.message);
      const userData = req.body;

      res.status(401).render("pages/loginForm", {
        title: "Login Form",
        errors: errorMessages,
        data: userData,
      });
      return;
    }

    await loginUser(req, user);

    res.redirect(`/user/${user.id}`);
  } catch (err) {
    return next(err);
  }
  // passport.authenticate(
  //   "local",
  //   (err: Error, user: User | false, info: { message: string }) => {
  //     if (err) return next(err);

  //     if (!user) {
  //       const userData = req.body;
  //       const errorMessages = createErrorMessageArray(info.message);

  //       res.status(401).render("pages/loginForm", {
  //         errors: errorMessages,
  //         data: userData,
  //       });
  //       return;
  //     }

  //     req.logIn(user, (err) => {
  //       if (err) return next(err);

  //       res.redirect(`/user/${user.id}`);
  //       return;
  //     });
  //   }
  // )(req, res, next);
};

export default {
  register_get,
  register_post,
  login_get,
  login_authenticate,
};
