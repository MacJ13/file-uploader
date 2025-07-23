import { body } from "express-validator";

export const folderValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("title must not be empty")
    .isLength({ min: 3, max: 20 })
    .withMessage(
      "username must contain at least 3 letters and maximum 20 lettes"
    ),
];
