import { HandlerType } from "../types/handlers";

const get_homepage: HandlerType = function (req, res, next) {
  res.render("pages/home", { message: "Hello World" });
};

export default { get_homepage };
