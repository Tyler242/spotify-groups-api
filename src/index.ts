import express, { type Request, type Response } from "express";
import session from "express-session";
import bodyParser from "body-parser";
import { config } from "dotenv";

import authRoutes from "./routes/auth";
import sessionRoutes from "./routes/session";
import { ErrorResult } from "./models/server/Error";

declare module "express-session" {
  interface SessionData {
    token: string;
    refresh_token: string;
  }
}

const app = express();
const port = "4200" || process.env.PORT;

config();

app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.session_secret!,
    resave: false,
    saveUninitialized: false,
  }),
);

app.use("/auth", authRoutes);
app.use("/session", sessionRoutes);

app.get("/", (req, res, next) => {
  res.status(200).json({ message: "Hello World" });
});

app.use((err: ErrorResult, req: Request, res: Response) => {
  return res.status(500).json();
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
