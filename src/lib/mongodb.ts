import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI est manquant dans les variables d'environnement.");
}
const SAFE_MONGODB_URI = MONGODB_URI;

type CachedMongoose = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: CachedMongoose | undefined;
}

const cached = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(SAFE_MONGODB_URI, {
      dbName: process.env.MONGODB_DB || "cvfacile",
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
