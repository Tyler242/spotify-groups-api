import type { NextFunction, Request, Response } from "express";
import connect from "../models/connect";
import User, { IUser } from "../models/database/User";
import { sign } from "jsonwebtoken";
import type TokenObject from "../models/TokenObject";
import { convertToSafeUser } from "../models/server/UserSeverModel";
import mongoose from "mongoose";
import { ErrorResult, HttpStatusCode, internalServerError } from "../models/server/Error";

export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    console.log('request');
    const email = req.body.email;
    const spotifyUuid = req.body.spotifyUuid;

    if (!spotifyUuid || !email) {
        const err: ErrorResult = { message: "Invalid request body", code: HttpStatusCode.BAD_REQUEST };
        return next(err);
    }

    try {
        await connect();
    } catch (err) {
        return next(internalServerError());
    }

    let user: IUser | null = await User.findOne({
        email,
        spotify_uuid: spotifyUuid,
    });

    let loggedInUser: IUser;

    try {
        if (!user) {
            user = await createUser(email, spotifyUuid);
        }
        loggedInUser = await loginUser(user);

        await mongoose.disconnect();
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

async function createUser(email: string, spotifyUuid: string) {
    const userModel: IUser = new User({
        email,
        spotify_uuid: spotifyUuid,
    });

    const user: IUser = await User.create(userModel);
    return user;
}
