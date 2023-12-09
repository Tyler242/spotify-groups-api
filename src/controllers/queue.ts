import { NextFunction, Request, Response } from "express";
import Queue, { IQueue } from "../models/database/Queue";
import User, { IUser } from "../models/database/User";

export async function addToQueue(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error("Internal Server Error");
        }
        const queueId = req.params.queueId;

        // get the queue
        let queueObj: IQueue | null = await Queue.findById(queueId);
        if (!queueObj) {
            throw new Error("Unable to find Queue");
        }

        // is current user part of this queue?
        if (!queueObj.participantIds.includes(userId)) {
            throw new Error("Unauthorized");
        }

        queueObj.queue.push(req.body.trackId);
        if (queueObj.queue.length == 1) {
            queueObj.currentTrack = req.body.trackId;
        }
        queueObj = await queueObj.save();

        return res.status(200).json({ queue: queueObj.queue });
    } catch (err) {
        return next(err);
    }
}

export async function getQueue(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error("Internal Server Error");
        }
        const queueId = req.params.queueId;

        const queue: IQueue | null = await Queue.findById(queueId);
        if (!queue) {
            throw new Error("Unable to find Queue");
        }

        // is current user part of this queue?
        if (!queue.participantIds.includes(userId)) {
            throw new Error("Unauthorized");
        }
        return res.status(200).json(queue);
    } catch (err) {
        return next(err);
    }
}

export async function createQueue(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error("Internal Server Error");
        }

        // check for an existing queue
        let queue: IQueue | null = await Queue.findOne({ creatorId: userId });

        // create a queue if there isn't one
        if (!queue) {
            queue = new Queue({
                creatorId: userId,
                participantIds: [userId]
            });
            queue = await queue.save();
        }

        return res.status(201).json(queue);
    } catch (err) {
        return next(err);
    }
}

export async function removeFromQueue(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error("Internal Server Error");
        }
        const queueId = req.params.queueId;
        const trackId = req.params.trackId;

        // get the queue
        let queueObj: IQueue | null = await Queue.findById(queueId);
        if (!queueObj) {
            throw new Error("Unable to find Queue");
        }

        // is current user part of this queue?
        if (!queueObj.participantIds.includes(userId)) {
            throw new Error("Unauthorized");
        }

        if (queueObj.queue.includes(trackId)) {
            queueObj.queue = queueObj.queue.filter(track => track !== trackId);
            let queue = await queueObj.save();
            return res.status(200).json(queue);
        } else {
            return res.status(200).json(queueObj);
        }
    } catch (err) {
        return next(err);
    }
}

export async function updateQueue(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error("Internal Server Error");
        }
        const queueId = req.params.queueId;
        const trackId = req.params.trackId;
        const index = parseInt(req.params.index);

        // get the queue
        let queueObj: IQueue | null = await Queue.findById(queueId);
        if (!queueObj) {
            throw new Error("Unable to find Queue");
        }

        // is current user part of this queue?
        if (!queueObj.participantIds.includes(userId)) {
            throw new Error("Unauthorized");
        }

        // is the track in the queue?
        if (queueObj.queue.includes(trackId)) {

            // remove track
            queueObj.queue = queueObj.queue.filter(track => track !== trackId);
            // insert by creating a new array out of the old array
            queueObj.queue = [
                ...queueObj.queue.slice(0, index),
                trackId,
                ...queueObj.queue.slice(index)
            ];
            let queue = await queueObj.save();

            return res.status(200).json(queue);
        } else {
            throw new Error("Track is not in queue");
        }
    } catch (err) {
        return next(err);
    }
}

export async function incrementQueue(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error("Internal Server Error");
        }
        const queueId = req.params.queueId;

        let queue: IQueue | null = await Queue.findById(queueId);
        if (!queue) {
            throw new Error("Unable to find Queue");
        }

        // is current user part of this queue?
        if (!queue.participantIds.includes(userId)) {
            throw new Error("Unauthorized");
        }

        queue.queue.shift();
        queue.currentTrack = queue.queue[0] || null;
        queue = await queue.save();

        return res.status(200).json(queue);
    } catch (err) {
        return next(err);
    }
}

export async function pauseQueue(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error("Internal Server Error");
        }
        const queueId = req.params.queueId;

        let queue: IQueue | null = await Queue.findById(queueId);
        if (!queue) {
            throw new Error("Unable to find Queue");
        }

        // is current user part of this queue?
        if (!queue.participantIds.includes(userId)) {
            throw new Error("Unauthorized");
        }

        queue.isPaused = true;
        queue = await queue.save();
        return res.status(200).json(queue);
    } catch (err) {
        return next(err);
    }
}

export async function playQueue(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error("Internal Server Error");
        }
        const queueId = req.params.queueId;

        let queue: IQueue | null = await Queue.findById(queueId);
        if (!queue) {
            throw new Error("Unable to find Queue");
        }

        // is current user part of this queue?
        if (!queue.participantIds.includes(userId)) {
            throw new Error("Unauthorized");
        }

        queue.isPaused = false;
        queue = await queue.save();
        return res.status(200).json(queue);
    } catch (err) {
        return next(err);
    }
}

export async function deleteQueue(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error("Internal Server Error");
        }
        const queueId = req.params.queueId;

        let queue: IQueue | null = await Queue.findById(queueId);
        if (!queue) {
            throw new Error("Unable to find Queue");
        }

        if (userId !== queue.creatorId) {
            throw new Error("Only queue creator can delete the queue");
        }

        await queue.deleteOne();

        return res.status(200).json({ success: true });
    } catch (err) {
        return next(err);
    }
}

export async function getFriendQueues(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error("Internal Server Error");
        }

        let user: IUser | null = await User.findById(userId).select("friends").exec();
        if (!user) {
            return res.status(204).json([]);
        }

        let queues: { _id: string, creatorId: string, creatorName: string | null }[] = [];
        for (let friend of user.friends) {
            let queue: IQueue | null = await Queue.findOne({ creatorId: friend.userId }).select("_id creatorId").exec();
            if (queue) {
                queues.push({ _id: queue._id, creatorId: queue.creatorId, creatorName: friend.name });
            }
        }

        return res.status(200).json({ length: queues.length, queues });
    } catch (err) {
        return next(err);
    }
}

export async function joinQueue(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error("Internal Server Error");
        }
        const queueId = req.params.queueId;

        let queue: IQueue | null = await Queue.findById(queueId);
        if (!queue) {
            throw new Error("Unable to find Queue");
        }

        // let creator: IUser | null = await User.findById(queue.creatorId).select("friends").exec();
        // if (!creator) {
        //     throw new Error("Internal Server Error");
        // }

        // let userInCreatorsFriends = creator.friends.find(friend => friend.userId == userId);
        // if (!userInCreatorsFriends) {
        //     throw new Error("User is not the Creators friend");
        // }

        // is current user part of this queue?
        if (queue.participantIds.includes(userId)) {
            return res.status(200).json(queue);
        }

        queue.participantIds.push(userId);
        queue = await queue.save();

        return res.status(200).json(queue);

    } catch (err) {
        return next(err);
    }
}

export async function leaveQueue(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error("Internal Server Error");
        }
        const queueId = req.params.queueId;

        let queue: IQueue | null = await Queue.findById(queueId);
        if (!queue) {
            throw new Error("Unable to find Queue");
        }

        if (userId === queue.creatorId) {
            return res.status(403).json("Creator cannot leave queue");
        }

        // is current user part of this queue?
        if (!queue.participantIds.includes(userId)) {
            return res.status(200).json(queue);
        }

        queue.participantIds = queue.participantIds.filter(id => id !== userId);
        queue = await queue.save();

        return res.status(200).json({ success: true });
    } catch (err) {
        return next(err);
    }
}

export async function removeUserFromQueue(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error("Internal Server Error");
        }
        const queueId = req.params.queueId;
        const userIdToRemove = req.params.userId;

        let queue: IQueue | null = await Queue.findById(queueId);
        if (!queue) {
            return res.status(404).json("Unable to find queue");
        }

        if (userId !== queue.creatorId) {
            return res.status(403).json("Only creator can remove others");
        }

        if (userIdToRemove === queue.creatorId) {
            return res.status(400).json("Cannot remove the creator from the queue");
        }

        queue.participantIds = queue.participantIds.filter(id => id !== userIdToRemove);
        queue = await queue.save();

        return res.status(200).json(queue);
    } catch (err) {
        return next(err);
    }
}