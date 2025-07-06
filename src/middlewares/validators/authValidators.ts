import { body } from "express-validator";
import { findUserByEmail, findUserByName } from "../../services/user.service";

export const registerValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("username must not be empty")
    .isLength({ min: 3 })
    .withMessage("username must contain at least 3 letters")
    .custom(async (val) => {
      const user = await findUserByName(val);
      if (user) {
        throw new Error("username already in user");
      }
    })
    .escape(),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email must not be empty")
    .isEmail()
    .withMessage("valid email structure")
    .custom(async (val) => {
      const user = await findUserByEmail(val);
      if (user) {
        throw new Error("email already in user");
      }
    })
    .escape(),
  body("password")
    .notEmpty()
    .withMessage("password must not by empty")
    .isLength({ min: 8 })
    .withMessage("password must contain at least 8 letters")
    .custom((value) => !/\s/.test(value))
    .withMessage("No spaces are allowed in the password")
    .escape(),
  body("confirm")
    .notEmpty()
    .withMessage("confirm password must not be empty")
    .isLength({ min: 8 })
    .withMessage("confirm password must contain at least 8 letters")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("passwords must be the same")
    .escape(),
];
