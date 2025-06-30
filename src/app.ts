import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";

import { PORT } from "./config/env.config";
import path from "path";
import homeRouter from "./routes/home.router";

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

app.use((req: Request, res: Response, next: NextFunction) => {
  const err = new Error("Page not exist!");

  next(err);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    console.log(err);
  }
  res.status(404).send(err.message);
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
