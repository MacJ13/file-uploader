import { validationResult } from "express-validator";
import { HandlerType, ValidationHandlerType } from "../types/handlers";
import { getValidationErrorMessages } from "../utils/errors/getValidationErrorMessages";

export const handleValidation = ({
  view,
  title,
}: ValidationHandlerType): HandlerType => {
  return (req, res, next) => {
    const fieldsData = req.body;
    const errorResult = validationResult(req);

    if (!errorResult.isEmpty()) {
      const errors = getValidationErrorMessages(errorResult.array());

      res.render(view, {
        title: title,
        errors: errors,
        data: fieldsData,
        action: req.originalUrl,
      });
      return;
    }

    next();
  };
};
