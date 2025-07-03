import { ErrorHandlerType } from "../types/handlers";
import CustomError from "../utils/errors/CustomError";

const handleError: ErrorHandlerType = (err, req, res, next) => {
  if (err instanceof CustomError) {
    const errorStatusCode = err.getStatusCode();

    if (errorStatusCode == 404) {
      res.statusCode = errorStatusCode;

      res.render("pages/404");
      return;
    }
  }
};

export default handleError;
