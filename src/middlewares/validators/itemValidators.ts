import { body } from "express-validator";

export const itemValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("title must not be empty")
    .isLength({ min: 2, max: 20 })
    .withMessage("title must contain at least 3 letters and maximum 20 lettes"),
];
