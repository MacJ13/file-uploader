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
  //1. get user date from req.body
  const userData = req.body;
  // 2. get error result from express validaton
  const errorResult = validationResult(req);

  // 3. check is errorResult is empty
  if (!errorResult.isEmpty()) {
    // 3a. render register Form with error validtion
    const errors = getValidationErrorMessages(errorResult.array());

    res.render("pages/registerForm", {
      title: "Register form",
      errors: errors,
      data: userData,
    });
    return;
  }

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

const login_post: HandlerType = (req, res, next) => {
  const userData = req.body;

  const errorResult = validationResult(req);

  if (!errorResult.isEmpty()) {
    // 3a. render register Form with error validtion
    const errors = getValidationErrorMessages(errorResult.array());

    res.render("pages/loginForm", {
      title: "Login Form",
      errors: errors,
      data: userData,
    });
    return;
  }

  next();
};

const login_authenticate: HandlerType = async (req, res, next) => {
  try {
    const { user, info } = await authenticateLocal(req, res, next);

    if (!user) {
      const errorMessages = createErrorMessageArray(info.message);
      const userData = req.body;

      res
        .status(401)
        .render("pages/loginForm", { errors: errorMessages, data: userData });
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
  login_post,
  login_authenticate,
};
