import { NextFunction, Request, Response } from "express";
import User, { IUser, safeUser } from "../models/database/User";

export async function addFriend(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const friendUserId = req.body.friendUserId;
        let friend: IUser | null = await User.findById(friendUserId);
        if (!friend) {
            throw new Error("User doesn't exist");
        }

        let user: IUser | null = await User.findById(userId);
        if (!user) {
            throw new Error("User doesn't exist");
        }

        if (user.friends.find(friend => friend.userId === friendUserId)) {
            return res.status(204).json();
        } else {
            user.friends.push({
                userId: friend._id,
                name: friend.name
            });
            user = await user.save();

            return res.status(201).json(safeUser(user));
        }
    } catch (err) {
        return next(err);
    }
}

export async function getFriends(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error("Unauthorized");
        }

        let user: IUser | null = await User.findById(userId);
        if (!user) {
            throw new Error("User doesn't exist");
        }

        return res.status(200).json(safeUser(user));
    } catch (err) {
        return next(err);
    }
}

export async function removeFriend(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error("Unauthorized");
        }

        let user: IUser | null = await User.findById(userId);
        if (!user) {
            throw new Error("User doesn't exist");
        }

        const friendUserId = req.params.friendUserId;
        let friend: IUser | null = await User.findById(friendUserId);
        if (!friend) {
            throw new Error("User doesn't exist");
        }

        if (!user.friends.find(friend => friend.userId === friendUserId)) {
            throw new Error("No friend relationship exists");
        }

        user.friends = user.friends.filter(friend => friend.userId !== friendUserId);
        user = await user.save();

        return res.status(200).json(safeUser(user));
    } catch (err) {
        return next(err);
    }
}

export async function searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const query = req.body.query;
        let users: IUser[] = await User.find({ name: new RegExp(query, "i") }).select("_id name").exec();

        // filter out the current user
        users = users.filter(user => user._id != userId);

        return res.status(200).json({ length: users.length, users });
    } catch (err) {
        return next(err);
    }
}

export async function getName(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error("Unauthorized");
        }
        const friendId = req.params.friendUserId;

        let user = await User.findById(userId).select("friends").exec();
        if (!user) {
            throw new Error("Unauthorized");
        }

        if (!user.friends.find(friend => friend.userId === friendId)) {
            throw new Error("No friend relationship exists");
        }

        let friend = await User.findById(friendId).select("name").exec();
        if (!friend) {
            throw new Error("User does not exist");
        }

        return res.status(200).json({ name: friend.name });
    } catch (err) {
        return next(err);
    }
}