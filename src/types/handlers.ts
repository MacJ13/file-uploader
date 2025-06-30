import { Request, Response, NextFunction } from "express";

export type HandlerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;
