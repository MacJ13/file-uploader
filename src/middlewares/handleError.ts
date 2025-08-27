import { ErrorHandlerType } from "../types/handlers";
import CustomError from "../utils/errors/CustomError";

const handleError: ErrorHandlerType = (err, req, res, next) => {
  const user = req.user;

  if (err instanceof CustomError) {
    const errorStatusCode = err.getStatusCode();
    const errorMessage = err.message;

    res.statusCode = errorStatusCode;

    res.render("pages/errorPage", {
      user,
      title: "error page",
      message: errorMessage,
      statusCode: errorStatusCode,
    });
    return;
  }
};

export default handleError;
