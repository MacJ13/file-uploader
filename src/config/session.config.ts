import session from "express-session";
import { SESSION_SECRET } from "./env.config";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import prisma from "./prisma.config";

export const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true, // reset maxAge with every request
  cookie: {
    maxAge: 1000 * 60 * 60,
  },
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000,
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
    sessionModelName: "session",
  }),
});
