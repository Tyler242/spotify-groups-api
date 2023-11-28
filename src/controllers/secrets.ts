import { NextFunction, Request, Response } from "express";

export function getSecrets(req: Request, res: Response, next: NextFunction) {
    res.status(200).json({ clientId: process.env.SPOTIFY_CLIENT_ID!, redirectUri: process.env.SPOTIFY_REDIRECT_URI! });
}