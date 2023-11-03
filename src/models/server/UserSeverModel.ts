import { IUser } from "../database/User";

export interface SafeUser {
  email: String;
  spotify_uuid: String;
  auth_token: {
    token: String;
    expires_in: Number;
  };
  id: String | undefined;
}

export function convertToSafeUser(user: IUser) {
  const safeUser: SafeUser = {
    email: user.email,
    spotify_uuid: user.spotify_uuid,
    auth_token: {
      token: user.auth_token.token,
      expires_in: user.auth_token.expires_in_minutes,
    },
    id: user._id!,
  };
  return safeUser;
}
