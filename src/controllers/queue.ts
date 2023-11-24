import { NextFunction, Request, Response } from "express";
import Queue, { IQueue } from "../models/database/Queue";
import connect from "../models/connect";
import mongoose from "mongoose";

export async function addToQueue(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error("Internal Server Error");
        }
        const queueId = req.params.queueId;

        await connect();

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
        queueObj = await queueObj.save();

        await mongoose.disconnect();
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

        await connect();

        const queue: IQueue | null = await Queue.findById(queueId);
        if (!queue) {
            throw new Error("Unable to find Queue");
        }
        await mongoose.disconnect();

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

        await connect();

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

        await mongoose.disconnect();
        return res.status(201).json(queue);
    } catch (err) {
        return next(err);
    }
}

export async function joinQueue(req: Request, res: Response, next: NextFunction) {

}