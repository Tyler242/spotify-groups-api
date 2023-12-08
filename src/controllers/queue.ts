import { NextFunction, Request, Response } from "express";
import Queue, { IQueue } from "../models/database/Queue";

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

export async function joinQueue(req: Request, res: Response, next: NextFunction) {

}
