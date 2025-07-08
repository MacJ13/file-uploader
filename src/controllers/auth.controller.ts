import { validationResult } from "express-validator";
import { HandlerType } from "../types/handlers";
import { saveUser } from "../services/user.service";

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
    const errors = errorResult.array();
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

const login_get: HandlerType = (req, res, next) => {
  res.render("pages/loginForm", { title: "Login form" });
};

export default { register_get, register_post, login_get };
