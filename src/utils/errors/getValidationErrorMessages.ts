import { ValidationError } from "express-validator";

export function getValidationErrorMessages(arr: ValidationError[]) {
  const errorMessages = arr.map((err) => err.msg as string);

  console.log(errorMessages);
  return errorMessages;
}
