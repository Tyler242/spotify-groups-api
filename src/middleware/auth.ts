import { type NextFunction, type Request, type Response } from "express";
import { type JwtPayload, verify } from "jsonwebtoken";

export default async function validateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response<unknown, Record<string, unknown>> | undefined> {
  const token = req.headers.authorization!;
  if (!token) {
    next(Error("Invalid Token"));
  }

  let decodedToken: string | JwtPayload;
  try {
    decodedToken = verify(token, process.env.jwt_secret!);
  } catch (err) {
    next(err);
    return;
  }
  return res.status(200).json({ message: "success" });
}
