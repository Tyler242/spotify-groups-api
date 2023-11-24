import { type NextFunction, type Request, type Response } from "express";
import { type JwtPayload, verify, decode } from "jsonwebtoken";
import User, { IUser } from "../models/database/User";
import connect from "../models/connect";
import mongoose from "mongoose";

export interface ExtendedJwtPayload extends JwtPayload {
  userId: String;
  spotifyUuid: String;
  email: String;
}

export default async function validateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      next(Error("Invalid Token"));
    }

    verify(token!, process.env.jwt_secret!);
    const { userId } = decode(token!) as {
      userId: string;
    }

    // validate the user
    await connect();
    const user: IUser | null = await User.findById(userId);
    await mongoose.disconnect();
    if (!user) {
      throw new Error("User doesn't exist");
    }
    req.userId = userId;

    next();
  } catch (err) {
    return next(err);
  }
}