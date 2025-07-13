import { HandlerType } from "../types/handlers";
import { saveUser } from "../services/user.service";

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
};

const logout_get: HandlerType = (req, res, next) => {
  req.logOut((err) => {
    if (err) return next(err);

    req.session.destroy((err) => {
      if (err) return next(err);

      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });
};

export default {
  register_get,
  register_post,
  login_get,
  login_authenticate,
  logout_get,
};
