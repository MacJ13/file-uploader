import { Request, Response, NextFunction } from "express";
import CustomError from "../utils/errors/CustomError";

export type HandlerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export type AsyncHandlerType<T> = (
  ...args: Parameters<HandlerType>
) => Promise<T>;

export type ErrorHandlerType = (
  err: Error | CustomError,
  ...args: Parameters<HandlerType>
) => void;

export type ValidationHandlerType = {
  view: string;
  title: string;
};
