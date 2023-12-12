import { NextFunction, Request, Response } from "express";
import Queue, { IQueue, IQueueItem } from "../models/database/Queue";
import User, { IUser } from "../models/database/User";
import { IPlayable } from "../models/database/Playable";

export async function addToQueue(req: Request, res: Response, next: NextFunction) {
    try {
        const playable = getPlayableFromBody(req);
        const userId = req.userId;
        if (!userId) {
            throw new Error("Internal Server Error");
        }
        const queueId = req.params.queueId;

        // get the queue
        let queue: IQueue | null = await Queue.findById(queueId).select("queue lengthOfQueue participants currentTrack").exec();
        if (!queue) {
            throw new Error("Unable to find Queue");
        }

        // is current user part of this queue?
        if (!queue.participants.find(user => user.userId === userId)) {
            throw new Error("Unauthorized");
        }

        let currentLength = queue.lengthOfQueue;
        if (currentLength > 0) {
            queue.queue[currentLength - 1].next = playable;
        } else {
            queue.currentTrack = {
                playable,
                next: null
            };
        }
        queue.queue.push({ playable, next: null });
        queue.lengthOfQueue = queue.queue.length;

        queue = await queue.save();

        return res.status(200).json({ queue: queue.queue });
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
        if (!queue.participants.find(user => user.userId === userId)) {
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
            let user = await User.findById(userId).select("name").exec();
            if (!user) {
                return res.status(500).json("Internal Server Error");
            }
            queue = new Queue({
                creatorId: userId,
                participants: [{
                    userId,
                    name: user.name
                }]
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
        let queue: IQueue | null = await Queue.findById(queueId);
        if (!queue) {
            throw new Error("Unable to find Queue");
        }

        // is current user part of this queue?
        if (!queue.participants.find(user => user.userId === userId)) {
            throw new Error("Unauthorized");
        }

        // -1 if not found
        let index = queue.queue.findIndex(item => item.playable.spotifyId === trackId);

        if (index !== -1) {
            if (queue.queue[index].next && index > 0) {
                // not in the head or tail position
                queue.queue[index - 1].next = queue.queue[index + 1].playable
                queue.queue = queue.queue.filter(item => item.playable.spotifyId !== trackId);
                queue.lengthOfQueue = queue.queue.length;
            } else if (!queue.queue[index].next || index == (queue.lengthOfQueue - 1)) {
                // in the tail position
                queue.queue.pop();
                queue.queue[index - 1].next = null;
                queue.lengthOfQueue = queue.queue.length;
            } else if (index == 0) {
                // in the head position
                if (queue.isPaused) {
                    queue.queue.shift();
                    queue.lengthOfQueue = queue.queue.length;
                } else {
                    return res.status(400).json("Cannot remove current track while playing");
                }
            }

            queue.currentTrack = queue.queue[0];
            queue = await queue.save();
            return res.status(200).json(queue);
        } else {
            return res.status(400).json("Not in queue");
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
        const newIndex = parseInt(req.params.index);

        // get the queue
        let queue: IQueue | null = await Queue.findById(queueId);
        if (!queue) {
            throw new Error("Unable to find Queue");
        }

        // is current user part of this queue?
        if (!queue.participants.find(user => user.userId === userId)) {
            throw new Error("Unauthorized");
        }

        let currIndex = queue.queue.findIndex(item => item.playable.spotifyId === trackId)

        // is the track in the queue?
        if (currIndex !== -1) {
            // switch places
            let playable = queue.queue[currIndex];
            let switchPlayable = queue.queue[newIndex];

            queue.queue[newIndex] = playable;
            queue.queue[currIndex] = switchPlayable;

            // reset the next mappings
            queue.queue = setNext(queue.queue);
            queue.currentTrack = queue.queue[0];
            queue = await queue.save();

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
        if (!queue.participants.find(user => user.userId === userId)) {
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
        if (!queue.participants.find(user => user.userId === userId)) {
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
        if (!queue.participants.find(user => user.userId === userId)) {
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
        if (queue.participants.find(user => user.userId === userId)) {
            return res.status(200).json(queue);
        }

        let user = await User.findById(userId).select("name").exec();
        if (!user) {
            return res.status(500).json("Internal Server Error");
        }

        queue.participants.push({
            userId,
            name: user.name
        });
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
        if (!queue.participants.find(user => user.userId === userId)) {
            return res.status(200).json(queue);
        }

        queue.participants = queue.participants.filter(user => user.userId !== userId);
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

        queue.participants = queue.participants.filter(user => user.userId !== userIdToRemove);
        queue = await queue.save();

        return res.status(200).json(queue);
    } catch (err) {
        return next(err);
    }
}

function getPlayableFromBody(req: Request): IPlayable {
    let body = req.body;
    if (!body) {
        console.error("Missing body");
        throw new Error("Bad Request");
    }

    if (!(body.duration && body.name && body.uri && body.spotifyId)) {
        console.error("Missing a base value");
        throw new Error("Bad Request");
    }

    if (body.image) {
        if (!(body.image.url && body.image.height && body.image.width)) {
            console.error("invalid image object");
            throw new Error("Bad Request");
        }
    }

    let playable: IPlayable = {
        image: body.image || null,
        artists: body.artists || [],
        duration: body.duration,
        name: body.name,
        uri: body.uri,
        spotifyId: body.spotifyId
    };
    return playable;
}

function setNext(queue: IQueueItem[]) {
    let length = queue.length;
    for (let i = 0; i < length; i++) {
        if (i < (length - 1)) {
            queue[i].next = queue[i + 1].playable;
        }
    }
    return queue;
}