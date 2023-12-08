import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IQueue extends mongoose.Document {
    queue: string[];
    creatorId: string;
    participantIds: string[];
    isPaused: boolean;
    currentTrack: string;
    positionMs: number;
};

const queueSchema = new Schema({
    queue: [String],
    creatorId: {
        type: String,
        required: true
    },
    participantIds: [String],
    isPaused: {
        type: Boolean,
        default: true
    },
    currentTrack: String,
    positionMs: Number
});

const Queue = mongoose.model<IQueue>("Queue", queueSchema);
export default Queue;