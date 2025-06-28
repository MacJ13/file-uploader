import express, { Request, Response, NextFunction } from "express";

const app = express();

const port = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const err = new Error("Page not exist!");

  next(err);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    console.log(err);
  }
  res.send(err.message);
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
