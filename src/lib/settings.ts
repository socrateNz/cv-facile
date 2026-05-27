import { connectToDatabase } from "@/lib/mongodb";
import { SettingsModel } from "@/models/Settings";

export async function getSiteSettings() {
  await connectToDatabase();
  let settings = await SettingsModel.findOne().lean();

  if (!settings) {
    // Si aucun paramètre n'existe, on en crée un avec les valeurs par défaut
    const newSettings = new SettingsModel({});
    await newSettings.save();
    settings = await SettingsModel.findOne().lean();
  }

  return settings;
}
