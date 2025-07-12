import { User } from "../../generated/prisma";
import { HandlerType } from "../types/handlers";

const get_user_homepage: HandlerType = (req, res, next) => {
  console.log(req.user);
  const user = req.user as User;
  // User
  // const user = req.user as User;
  res.send(user.id);
};

export default { get_user_homepage };
