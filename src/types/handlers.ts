import { Request, Response, NextFunction } from "express";
import CustomError from "../utils/errors/CustomError";

export type HandlerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export type ErrorHandlerType = (
  err: Error | CustomError,
  ...args: Parameters<HandlerType>
) => void;
