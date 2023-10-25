import type { NextFunction, Request, Response } from "express";
import connect from "../models/connect";
import User, { IUser } from "../models/database/User";
import { sign } from "jsonwebtoken";
import type TokenObject from "../models/TokenObject";
import { compare, hash } from "bcrypt";
import { convertToSafeUser } from "../models/server/UserSeverModel";

export async function signup(req: Request, res: Response, next: NextFunction) {
    const email = req.body.email;
    const password = req.body.password;
    const spotifyUuid = req.body.spotifyUuid;

    if (!password || !spotifyUuid || !email) {
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

    let hashedPassword: string;
    try {
        hashedPassword = await hashPassword(password);
    } catch (err) {
        return next(err);
    }

    const userModel: IUser = new User({
        email,
        password: hashedPassword,
        spotify_uuid: spotifyUuid,
    });

    const user: IUser = await User.create(userModel);

    return res.status(201).json(convertToSafeUser(user));
}

export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const email = req.body.email;
    const password = req.body.password;
    const spotifyUuid = req.body.spotifyUuid;

    await connect();
    const user: IUser | null = await User.findOne({
        email,
        spotify_uuid: spotifyUuid,
    });
    if (!user) {
        return next(Error("User doesn't exist"));
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
        return next(Error("Invalid Username & Password combination"));
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

async function hashPassword(password: string): Promise<string> {
    return await hash(password, 12);
}

async function comparePassword(
    password: string,
    hashedPassword: string,
): Promise<boolean> {
    return await compare(password, hashedPassword);
}
