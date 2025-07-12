import passport from "passport";
import { Request } from "express";
import { User } from "../../generated/prisma";
import { AsyncHandlerType } from "../types/handlers";

export const authenticateLocal: AsyncHandlerType<{
  user: User | false;
  info: { message: string };
}> = (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      "local",
      (err: Error, user: User | false, info: { message: string }) => {
        if (err) return reject(err);
        return resolve({ user: user || false, info: info! });
      }
    )(req, res, next);
  });
};

export const loginUser = (req: Request, user: User): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    req.logIn(user, (err) => (err ? reject(err) : resolve()));
  });
};

// function authenticateLocal(req: Request, res: Response, next: NextFunction) {
//   return new Promise<{ user: User | false; info: { message: string } }>(
//     (resolve, reject) => {
//       passport.authenticate("local", (err, user, info) => {
//         if (err) return reject(err);
//         resolve({ user: user || false, info: info! });
//       })(req, res, next);
//     }
//   );
// }
