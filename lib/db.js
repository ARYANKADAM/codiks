import mongoose from "mongoose";
import "@/models";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "codearena";

if (!MONGODB_URI) {
  throw new Error(
    "Missing MONGODB_URI. Add it to your .env.local — see .env.example."
  );
}

/**
 * Next.js reloads route handlers in dev, which would otherwise create a
 * new Mongoose connection on every request. We cache the connection (and
 * the in-flight connect promise) on the global object so it survives
 * hot reloads and is reused across serverless invocations.
 */
let cached = globalThis._mongooseCache;

if (!cached) {
  cached = globalThis._mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: MONGODB_DB_NAME,
        bufferCommands: false,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
