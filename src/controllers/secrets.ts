import { NextFunction, Request, Response } from "express";

export function getSecrets(req: Request, res: Response, next: NextFunction) {
    try {
        const secretsToken = req.headers.authorization?.replace("Bearer ", "");
        if (!secretsToken) {
            throw new Error("Unauthorized")
        }
        const accessCode = process.env.secrets_access_code!;
        if (secretsToken !== accessCode) {
            throw new Error("Unauthorized")
        }

        return res.status(200).json({ clientId: process.env.SPOTIFY_CLIENT_ID!, redirectUri: process.env.SPOTIFY_REDIRECT_URI! });
    } catch (err) {
        return next(err);
    }
}