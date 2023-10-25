import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  spotify_uuid: string;
  auth_token: {
    token: string;
    expires_in_minutes: Number;
  };
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  spotify_uuid: {
    type: String,
    required: true,
  },
  auth_token: {
    token: String,
    expires_in_minutes: Number,
  },
  created: { type: Date, default: Date.now },
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;
