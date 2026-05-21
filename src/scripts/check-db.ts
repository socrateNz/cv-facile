import "dotenv/config";
import { resolveSrv } from "node:dns/promises";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "cvfacile";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI manquant.");
}

const SAFE_MONGODB_URI = MONGODB_URI;

function parseMongoUri(uri: string) {
  try {
    const parsed = new URL(uri);
    return {
      protocol: parsed.protocol,
      host: parsed.host,
      dbFromUri: parsed.pathname.replace("/", "") || "(none)",
      hasUser: Boolean(parsed.username),
      query: parsed.search || "(none)",
    };
  } catch {
    return null;
  }
}

function getSrvLookupHost(uri: string) {
  try {
    const parsed = new URL(uri);
    return parsed.host.split(":")[0];
  } catch {
    return null;
  }
}

async function run() {

  await mongoose.connect(SAFE_MONGODB_URI, {
    dbName: MONGODB_DB,
    serverSelectionTimeoutMS: 12000,
    connectTimeoutMS: 12000,
    socketTimeoutMS: 15000,
  });

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Connexion Mongo ouverte mais database introuvable.");
  }
  const ping = await db.admin().ping();
  await mongoose.disconnect();
}

run().catch(async (error) => {
  await mongoose.disconnect();
  process.exit(1);
});
