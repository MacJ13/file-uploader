import { HandlerType } from "../types/handlers";
import CustomError from "../utils/errors/CustomError";

const notFound: HandlerType = (req, res, next) => {
  const error = new CustomError("Page doesn't exist", 404);

  next(error);
};

export default notFound;
