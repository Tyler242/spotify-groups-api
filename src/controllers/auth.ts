import type { NextFunction, Request, Response } from "express";
import connect from "../models/connect";
import User, { IUser } from "../models/database/User";
import { sign } from "jsonwebtoken";
import type TokenObject from "../models/TokenObject";
import { convertToSafeUser } from "../models/server/UserSeverModel";
import mongoose from "mongoose";

export async function signup(req: Request, res: Response, next: NextFunction) {
    const email = req.body.email;
    const spotifyUuid = req.body.spotifyUuid;

    if (!spotifyUuid || !email) {
        const err = new Error("Invalid Body");
        return next(err);
    }

    await connect();
    const userExists: IUser | null = await User.findOne({
        email,
        spotify_uuid: spotifyUuid,
    });
    if (userExists) {
        return next(Error("User aleady exists"));
    }


    const userModel: IUser = new User({
        email,
        spotify_uuid: spotifyUuid,
    });

    const user: IUser = await User.create(userModel);

    mongoose.disconnect();
    return res.status(201).json(convertToSafeUser(user));
}

export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const email = req.body.email;
    const spotifyUuid = req.body.spotifyUuid;

    await connect();
    const user: IUser | null = await User.findOne({
        email,
        spotify_uuid: spotifyUuid,
    });
    if (!user) {
        return next(Error("User doesn't exist"));
    }

    let tokenObject: TokenObject;
    try {
        tokenObject = createJwtToken(user);
    } catch (err) {
        next(err);
        return;
    }

    const updatedUser: IUser | null = await User.findByIdAndUpdate(
        user._id,
        { auth_token: tokenObject },
        { returnDocument: "after" },
    );

    mongoose.disconnect();
    return res.status(201).json(convertToSafeUser(updatedUser!));
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

// async function hashPassword(password: string): Promise<string> {
//     return await hash(password, 12);
// }

// async function comparePassword(
//     password: string,
//     hashedPassword: string,
// ): Promise<boolean> {
//     return await compare(password, hashedPassword);
// }
