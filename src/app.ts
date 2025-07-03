import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";

import { PORT } from "./config/env.config";
import path from "path";
import homeRouter from "./routes/home.router";
import notFound from "./middlewares/notFound";
import handleError from "./middlewares/handleError";

const app = express();

app.use(express.json());

app.use("/public", express.static(path.join(__dirname, "../public")));

app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/", homeRouter);

app.use(notFound);
app.use(handleError);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
