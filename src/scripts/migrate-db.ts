import "dotenv/config";
import { resolveSrv } from "node:dns/promises";
import mongoose from "mongoose";
import { hash } from "bcryptjs";
import { UserModel } from "../models/User";
import { CVModel } from "../models/CV";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "cv-facile";
const DEFAULT_PASSWORD = process.env.MIGRATION_DEFAULT_PASSWORD || "ChangeMe123!";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI manquant.");
}
const SAFE_MONGODB_URI = MONGODB_URI;

function parseMongoUri(uri: string) {
  try {
    const parsed = new URL(uri);
    return {
      protocol: parsed.protocol,
      hosts: parsed.host,
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

function printTopology(error: unknown) {
  const maybeError = error as { reason?: { servers?: Map<string, { type?: string; error?: Error }> } };
  const servers = maybeError?.reason?.servers;
  if (!servers || !(servers instanceof Map)) return;

  console.log("[migration] Etat des serveurs Atlas:");
  for (const [serverName, serverState] of servers.entries()) {
    const serverError =
      serverState?.error instanceof Error ? `${serverState.error.name}: ${serverState.error.message}` : "none";
    console.log(`- ${serverName} | type=${serverState?.type || "unknown"} | error=${serverError}`);
  }
}

async function run() {
  console.log("[migration] Debut migration.");
  console.log(`[migration] dbName cible: ${MONGODB_DB}`);

  const uriInfo = parseMongoUri(SAFE_MONGODB_URI);
  const srvHost = getSrvLookupHost(SAFE_MONGODB_URI);
  if (uriInfo) {
    console.log(
      `[migration] uri protocol=${uriInfo.protocol} host=${uriInfo.hosts} dbInUri=${uriInfo.dbFromUri} hasUser=${uriInfo.hasUser} query=${uriInfo.query}`,
    );
  } else {
    console.log("[migration] Impossible de parser MONGODB_URI (format inattendu).");
  }

  if (srvHost) {
    try {
      const srvRecords = await resolveSrv(`_mongodb._tcp.${srvHost}`);
      console.log(
        `[migration] SRV Atlas detectes pour ${srvHost}: ${srvRecords.map((record) => `${record.name}:${record.port}`).join(", ")}`,
      );
    } catch (dnsError) {
      console.log(`[migration] Echec resolution SRV Atlas pour ${srvHost}:`, dnsError);
    }
  } else {
    console.log("[migration] Host SRV introuvable depuis MONGODB_URI.");
  }

  mongoose.connection.on("connecting", () => console.log("[migration] mongoose connecting..."));
  mongoose.connection.on("connected", () => console.log("[migration] mongoose connected."));
  mongoose.connection.on("open", () => console.log("[migration] mongoose open."));
  mongoose.connection.on("error", (err) => console.log("[migration] mongoose connection error:", err));
  mongoose.connection.on("disconnected", () => console.log("[migration] mongoose disconnected."));

  await mongoose.connect(SAFE_MONGODB_URI, {
    dbName: MONGODB_DB,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 20000,
  });
  console.log("[migration] Connecte a MongoDB.");

  const adminDb = mongoose.connection.db?.admin();
  if (!adminDb) {
    throw new Error("Admin DB introuvable apres connexion.");
  }
  const pingResult = await adminDb.ping();
  console.log("[migration] Ping admin OK:", pingResult);

  console.log("[migration] Lecture des utilisateurs...");
  const users = await UserModel.find().lean<{
    _id: mongoose.Types.ObjectId;
    email?: string;
    emailOrPhone?: string;
    fullName?: string;
    passwordHash?: string;
    mustResetPassword?: boolean;
  }[]>();

  let updatedUsers = 0;
  const defaultPasswordHash = await hash(DEFAULT_PASSWORD, 10);
  console.log(`[migration] Utilisateurs trouves: ${users.length}`);

  for (const user of users) {
    const setPayload: Record<string, unknown> = {};
    const email = (user.email || user.emailOrPhone || "").trim().toLowerCase();

    if (!user.email && email) setPayload.email = email;
    if (!user.emailOrPhone && email) setPayload.emailOrPhone = email;
    if (typeof user.fullName !== "string") setPayload.fullName = "";
    if (!user.passwordHash) {
      setPayload.passwordHash = defaultPasswordHash;
      setPayload.mustResetPassword = true;
    }

    if (Object.keys(setPayload).length > 0) {
      await UserModel.updateOne({ _id: user._id }, { $set: setPayload });
      updatedUsers += 1;
    }
  }

  const cvs = await CVModel.find({ $or: [{ email: { $exists: false } }, { email: "" }] })
    .select("_id userId")
    .lean<{ _id: mongoose.Types.ObjectId; userId: mongoose.Types.ObjectId }[]>();
  console.log(`[migration] CV sans email: ${cvs.length}`);

  let updatedCVs = 0;
  for (const cv of cvs) {
    const owner = await UserModel.findById(cv.userId).select("email").lean<{ email?: string } | null>();
    if (owner?.email) {
      await CVModel.updateOne({ _id: cv._id }, { $set: { email: owner.email } });
      updatedCVs += 1;
    }
  }

  await UserModel.syncIndexes();
  await CVModel.syncIndexes();
  console.log("[migration] Index synchronises.");

  console.log(`Migration terminee. Users modifies: ${updatedUsers}. CV modifies: ${updatedCVs}.`);
  if (updatedUsers > 0) {
    console.log(
      `Certains utilisateurs ont recu un mot de passe temporaire. Valeur actuelle: ${DEFAULT_PASSWORD}`,
    );
  }

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("Echec migration:", error);
  printTopology(error);
  await mongoose.disconnect();
  process.exit(1);
});
