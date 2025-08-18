import { User } from "../../generated/prisma";
import { getDashboardItems } from "../services/user.service";
import { HandlerType } from "../types/handlers";

const get_user_dashboard: HandlerType = async (req, res, next) => {
  // console.log(req.user);
  // 1. get user data
  const user = req.user as User;

  try {
    // 2. get files and folders
    const [folders, files] = await getDashboardItems(user.id);
    res.render("pages/userDashboard", {
      title: "User Dashboard",
      user: user,
      folders: folders,
      files: files,
    });
  } catch (err) {
    next(err);
  }
};

const get_user_settings: HandlerType = async (req, res, next) => {
  const user = req.user as User;

  res.render("pages/userSettings", {
    title: "user settings",
    user: user,
  });
};

export default { get_user_dashboard, get_user_settings };
