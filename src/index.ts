import express, { type Request, type Response } from "express";
import session from "express-session";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { config } from "dotenv";

import authRoutes from "./routes/auth";
import sessionRoutes from "./routes/session";
import queueRoutes from "./routes/queue";
import secretRoutes from "./routes/secrets";
import friendRoutes from "./routes/friends";

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
app.use("/queue", queueRoutes);
app.use("/secrets", secretRoutes);
app.use("/friends", friendRoutes);

app.get("/", (req, res, next) => {
  res.status(200).json({ message: "Hello World" });
});

app.use((err: any, req: Request, res: Response) => {
  res.status(500).json(err);
});

const MONGO_URI = process.env.MONGO_URI!;
const MONGO_USERNAME = process.env.MONGO_USERNAME!;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD!;

const connectionUri = MONGO_URI.replace("<username>", MONGO_USERNAME).replace(
  "<password>",
  MONGO_PASSWORD,
);

mongoose.connect(connectionUri).then(result => {
  app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
  });
}).catch(err => console.error);
