import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IFriend {
  userId: string,
  name: string | null;
}

export interface IUser extends mongoose.Document {
  name: string | null;
  email: string;
  spotify_uuid: string;
  auth_token: {
    token: string;
    expires_in_minutes: Number;
  };
  friends: IFriend[];
}

const userSchema = new Schema({
  name: String,
  email: {
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
  friends: [{
    userId: {
      type: String,
      required: true
    },
    name: String
  }]
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;


export interface ISafeUser {
  id: string,
  name: string | null,
  friends: IFriend[];
}
export function safeUser(userModel: IUser): ISafeUser {
  return {
    id: userModel._id,
    name: userModel.name,
    friends: userModel.friends
  }
}