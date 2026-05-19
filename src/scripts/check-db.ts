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
  console.log("[check-db] Demarrage diagnostic...");
  console.log(`[check-db] DB cible: ${MONGODB_DB}`);

  const parsed = parseMongoUri(SAFE_MONGODB_URI);
  const srvHost = getSrvLookupHost(SAFE_MONGODB_URI);
  if (parsed) {
    console.log(
      `[check-db] uri protocol=${parsed.protocol} host=${parsed.host} dbInUri=${parsed.dbFromUri} hasUser=${parsed.hasUser} query=${parsed.query}`,
    );
  }

  if (srvHost) {
    try {
      const srvRecords = await resolveSrv(`_mongodb._tcp.${srvHost}`);
      console.log(
        `[check-db] SRV OK pour ${srvHost}: ${srvRecords.map((record) => `${record.name}:${record.port}`).join(", ")}`,
      );
    } catch (error) {
      console.log(`[check-db] SRV KO pour ${srvHost}:`, error);
    }
  } else {
    console.log("[check-db] Host SRV introuvable depuis MONGODB_URI.");
  }

  mongoose.connection.on("connecting", () => console.log("[check-db] mongoose connecting..."));
  mongoose.connection.on("connected", () => console.log("[check-db] mongoose connected."));
  mongoose.connection.on("open", () => console.log("[check-db] mongoose open."));
  mongoose.connection.on("error", (error) => console.log("[check-db] mongoose error:", error));
  mongoose.connection.on("disconnected", () => console.log("[check-db] mongoose disconnected."));

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
  console.log("[check-db] Ping admin OK:", ping);
  await mongoose.disconnect();
  console.log("[check-db] Diagnostic termine avec succes.");
}

run().catch(async (error) => {
  console.error("[check-db] Echec diagnostic:", error);
  await mongoose.disconnect();
  process.exit(1);
});
