import type { NextFunction, Request, Response } from "express";
import User, { IUser } from "../models/database/User";
import { sign } from "jsonwebtoken";
import type TokenObject from "../models/TokenObject";
import { convertToSafeUser } from "../models/server/UserSeverModel";
import { ErrorResult, HttpStatusCode, internalServerError } from "../models/server/Error";

export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const name: string | null = req.body.name || null;
    const email: string = req.body.email;
    const spotifyUuid: string = req.body.spotifyUuid;

    if (!spotifyUuid || !email) {
        const err: ErrorResult = { message: "Invalid request body", code: HttpStatusCode.BAD_REQUEST };
        return next(err);
    }

    let user: IUser | null = await User.findOne({
        email,
        spotify_uuid: spotifyUuid,
    });

    let loggedInUser: IUser;

    try {
        if (!user) {
            user = await createUser(email, spotifyUuid, name);
        }
        loggedInUser = await loginUser(user);

        return res.status(201).json(convertToSafeUser(loggedInUser));
    } catch (err) {
        return next(internalServerError());
    }
}

export function refresh() {
    console.log("TODO refresh");
}

function createJwtToken(user: IUser): TokenObject {
    const tokenObj: TokenObject = {
        token: "",
        expires_in_minutes: 0,
    };

    const expires_in = "2h";
    tokenObj.token = sign(
        {
            userId: user._id,
            spotifyUuid: user.spotify_uuid,
            email: user.email,
        },
        process.env.jwt_secret!,
        {
            expiresIn: expires_in,
        },
    );
    tokenObj.expires_in_minutes = 120;

    return tokenObj;
}

async function loginUser(user: IUser) {
    let tokenObject = createJwtToken(user);

    const updatedUser: IUser | null = await User.findByIdAndUpdate(
        user._id,
        { auth_token: tokenObject },
        { returnDocument: "after" },
    );
    if (!updatedUser) {
        throw new Error("Unable to Login");
    }

    return updatedUser
}

async function createUser(email: string, spotifyUuid: string, name: string | null) {
    const userModel: IUser = new User({
        name,
        email,
        spotify_uuid: spotifyUuid,
    });

    const user: IUser = await User.create(userModel);
    return user;
}
