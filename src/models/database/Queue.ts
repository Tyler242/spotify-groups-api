import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IQueue extends mongoose.Document {
    queue: string[];
    creatorId: string;
    participantIds: string[];
};

const queueSchema = new Schema({
    queue: [String],
    creatorId: {
        type: String,
        required: true
    },
    participantIds: [String]
});

const Queue = mongoose.model<IQueue>("Queue", queueSchema);
export default Queue;