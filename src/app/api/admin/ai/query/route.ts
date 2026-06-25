import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { CVModel } from "@/models/CV";
import { PaymentModel } from "@/models/Payment";
import { assertRole, getSessionUser } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session || !assertRole(session.role, "admin")) {
      return NextResponse.json({ message: "Accès admin requis." }, { status: 403 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "La clé API Gemini n'est pas configurée." },
        { status: 500 }
      );
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Aucun prompt fourni." }, { status: 400 });
    }

    await connectToDatabase();

    // Récupérer les statistiques réelles de l'application
    const [
      usersCount,
      cvsCount,
      completedPaymentsCount,
      recentUsers,
      recentCVs,
      recentPayments
    ] = await Promise.all([
      UserModel.countDocuments(),
      CVModel.countDocuments(),
      PaymentModel.countDocuments({ status: "completed" }),
      UserModel.find().select("fullName email createdAt").sort({ createdAt: -1 }).limit(5).lean(),
      CVModel.find().select("fullName title template createdAt").sort({ createdAt: -1 }).limit(5).lean(),
      PaymentModel.find().sort({ createdAt: -1 }).limit(5).populate("userId", "fullName email").lean()
    ]);

    const revenue = completedPaymentsCount * 500; // Chaque téléchargement payé coûte 500 FCFA

    const systemInstruction = `
Tu es l'Assistant IA exclusif pour l'Administrateur de "CVFacile", une plateforme web de création de CV au Cameroun. 
Voici l'état actuel et réel des données de l'application :

--- STATISTIQUES GLOBALES ---
- Nombre total d'utilisateurs inscrits : ${usersCount}
- Nombre total de CV créés : ${cvsCount}
- Nombre total de paiements complétés (téléchargements payés) : ${completedPaymentsCount}
- Chiffre d'affaires total : ${revenue} FCFA (chaque téléchargement coûte 500 FCFA)

--- 5 DERNIERS UTILISATEURS INSCRITS ---
${recentUsers.map((u: any) => `- ${u.fullName || "Sans nom"} (${u.email || "Pas d'email"}), inscrit le ${u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-FR") : "N/A"}`).join("\n")}

--- 5 DERNIERS CV CRÉÉS ---
${recentCVs.map((c: any) => `- ${c.fullName || "Sans nom"} : "${c.title || "Sans titre"}" (Modèle: ${c.template || "Standard"}), créé le ${c.createdAt ? new Date(c.createdAt).toLocaleDateString("fr-FR") : "N/A"}`).join("\n")}

--- 5 DERNIERS PAIEMENTS ---
${recentPayments.map((p: any) => `- Montant: ${p.amount} FCFA, Statut: ${p.status}, Référence: ${p.reference}, par: ${p.userId?.fullName || p.userId?.email || p.guestId || "Invité"}`).join("\n")}
-----------------------------

Ton rôle est d'aider l'admin à analyser ces données, de répondre à toutes ses questions sur ces statistiques, de l'aider à concevoir des emails marketing pour les utilisateurs, à rédiger des articles SEO, ou à analyser des stratégies de croissance basées sur ces données.
Réponds en français de manière professionnelle, claire et structurée. N'hésite pas à faire des petits tableaux en Markdown pour présenter les statistiques ou données si l'admin le demande.
`;

    let text = "";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent({
        contents: [
          { role: "user", parts: [{ text: systemInstruction + "\n\nVoici ma demande:\n" + prompt }] }
        ]
      });
      const response = await result.response;
      text = response.text();
    } catch (err: any) {
      if (err.status === 503 || err.message?.includes("503")) {
        console.log("gemini-2.5-flash saturé (503), fallback vers gemini-1.5-flash...");
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const fallbackResult = await fallbackModel.generateContent({
          contents: [
            { role: "user", parts: [{ text: systemInstruction + "\n\nVoici ma demande:\n" + prompt }] }
          ]
        });
        const fallbackResponse = await fallbackResult.response;
        text = fallbackResponse.text();
      } else {
        throw err;
      }
    }

    return NextResponse.json({ success: true, text });
  } catch (error: any) {
    console.error("Erreur Admin AI API:", error);
    if (error.status === 503 || error.message?.includes("503")) {
      return NextResponse.json(
        { error: "Le service d'intelligence artificielle (Google Gemini) est actuellement très sollicité. Veuillez patienter et réessayer dans quelques secondes." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement avec l'IA." },
      { status: 500 }
    );
  }
}
