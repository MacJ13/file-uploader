import express from "express";
import morgan from "morgan";

import { PORT } from "./config/env.config";
import path from "path";
import homeRouter from "./routes/home.router";
import notFound from "./middlewares/notFound";
import handleError from "./middlewares/handleError";
import authRouter from "./routes/auth.router";
import { sessionMiddleware } from "./config/session.config";
import passport from "./config/passport.config";
import userRouter from "./routes/user.router";

const app = express();

app.use(express.json());

app.use("/public", express.static(path.join(__dirname, "../public")));

app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(sessionMiddleware);

app.use(passport.session());

app.use("/", homeRouter);
app.use("/auth", authRouter);

app.use(notFound);
app.use(handleError);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
