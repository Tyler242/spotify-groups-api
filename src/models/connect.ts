import mongoose from "mongoose";

export default async function connect() {
  const MONGO_URI = process.env.MONGO_URI!;
  const MONGO_USERNAME = process.env.MONGO_USERNAME!;
  const MONGO_PASSWORD = process.env.MONGO_PASSWORD!;

  const connectionUri = MONGO_URI.replace("<username>", MONGO_USERNAME).replace(
    "<password>",
    MONGO_PASSWORD,
  );

  const mongooseClient = await mongoose.connect(connectionUri);
  return mongooseClient;
}
