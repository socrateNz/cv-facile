/**
 * Script de seed : crée l'admin par défaut si il n'existe pas.
 * Usage : npx tsx src/scripts/seed-admin.ts
 *
 * Credentials par défaut :
 *   Email    : admin@cvfacile.com
 *   Password : Admin@2024!
 */

import { hash } from "bcryptjs";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB || "cv-facile";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@cvfacile.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@2024!";
const ADMIN_NAME = "Administrateur";

async function seed() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI manquant dans .env");
    process.exit(1);
  }

  console.log("🔗 Connexion à MongoDB...");
  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });
  console.log("✅ Connecté !");

  const UserModel =
    mongoose.models.User ||
    mongoose.model(
      "User",
      new mongoose.Schema({
        emailOrPhone: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        fullName: { type: String, default: "" },
        passwordHash: { type: String, required: true },
        mustResetPassword: { type: Boolean, default: false },
        role: { type: String, enum: ["user", "admin"], default: "user" },
      }),
    );

  const existing = await UserModel.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`ℹ️  Admin déjà existant : ${ADMIN_EMAIL}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await hash(ADMIN_PASSWORD, 10);
  await UserModel.create({
    emailOrPhone: ADMIN_EMAIL,
    email: ADMIN_EMAIL,
    fullName: ADMIN_NAME,
    passwordHash,
    role: "admin",
  });

  console.log("✅ Admin créé avec succès !");
  console.log(`   Email    : ${ADMIN_EMAIL}`);
  console.log(`   Password : ${ADMIN_PASSWORD}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Erreur :", err);
  process.exit(1);
});
