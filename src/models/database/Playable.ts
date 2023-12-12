import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface Image {
    url: string;
    height: number;
    width: number;
}

export interface IPlayable {
    image: Image | null;
    artists: string[];
    duration: number;
    name: string;
    uri: string;
    spotifyId: string;
}

export const Playable = new Schema({
    image: {
        url: String,
        height: Number,
        width: Number
    },
    artists: [String],
    duration: {
        type: Number,
        default: 0
    },
    name: {
        type: String,
        required: true
    },
    uri: {
        type: String,
        required: true
    },
    spotifyId: {
        type: String,
        required: true
    }
});