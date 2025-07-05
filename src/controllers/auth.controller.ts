import { HandlerType } from "../types/handlers";

const register_get: HandlerType = (req, res, next) => {
  res.render("pages/registerForm", { title: "Register form" });
};

export default { register_get };
