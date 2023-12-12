import mongoose from "mongoose";
import { IPlayable, Playable } from "./Playable";
import { IFriend } from "./User";
const Schema = mongoose.Schema;

export interface IQueueItem {
    playable: IPlayable;
    next: IPlayable | null;
}

export interface IQueue extends mongoose.Document {
    queue: IQueueItem[];
    lengthOfQueue: number;
    creatorId: string;
    participants: IFriend[];
    isPaused: boolean;
    currentTrack: IQueueItem | null;
    positionMs: number;
};

const queueSchema = new Schema({
    queue: [{
        playable: {
            type: Playable,
            required: true
        },
        next: Playable || null
    }],
    lengthOfQueue: {
        type: Number,
        default: 0
    },
    creatorId: {
        type: String,
        required: true
    },
    participants: [{
        userId: {
            type: String,
            required: true
        },
        name: String
    }],
    isPaused: {
        type: Boolean,
        default: true
    },
    currentTrack: {
        playable: Playable || null,
        next: Playable || null
    },
    positionMs: Number
});

const Queue = mongoose.model<IQueue>("Queue", queueSchema);
export default Queue;