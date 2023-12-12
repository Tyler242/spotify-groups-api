import mongoose from "mongoose";
import { IPlayable, Playable } from "./Playable";
const Schema = mongoose.Schema;

export interface IQueueItem {
    playable: IPlayable;
    next: IPlayable | null;
}

export interface IQueue extends mongoose.Document {
    queue: IQueueItem[];
    lengthOfQueue: number;
    creatorId: string;
    participantIds: string[];
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
    participantIds: [String],
    isPaused: {
        type: Boolean,
        default: true
    },
    currentTrack: {
        playable: {
            type: Playable,
            required: true
        },
        next: Playable || null
    } || null,
    positionMs: Number
});

const Queue = mongoose.model<IQueue>("Queue", queueSchema);
export default Queue;