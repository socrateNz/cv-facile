import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { SettingsModel } from "@/models/Settings";
import { assertRole, getSessionUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";

export async function GET(req: NextRequest) {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error("GET Settings Error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Auth check
    const session = getSessionUser(req);
    if (!session || !assertRole(session.role, "admin")) {
      return NextResponse.json({ message: "Accès admin requis." }, { status: 403 });
    }

    const payload = await req.json();
    
    // Update the single settings document (or create if missing)
    let settings = await SettingsModel.findOne();
    if (!settings) {
      settings = new SettingsModel(payload);
    } else {
      settings.set(payload);
    }
    
    await settings.save();

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error("PUT Settings Error:", error);
    return NextResponse.json({ message: "Erreur lors de la sauvegarde" }, { status: 500 });
  }
}
