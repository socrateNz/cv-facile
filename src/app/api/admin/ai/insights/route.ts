import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { CVModel } from "@/models/CV";
import { PaymentModel } from "@/models/Payment";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "La clé API Gemini n'est pas configurée." },
        { status: 500 }
      );
    }

    await connectToDatabase();

    // Récupérer quelques données anonymisées
    const [usersCount, cvsCount, completedPaymentsCount, recentCVs] = await Promise.all([
      UserModel.countDocuments(),
      CVModel.countDocuments(),
      PaymentModel.countDocuments({ status: "completed" }),
      CVModel.find({}, { title: 1, template: 1, _id: 0 }).sort({ createdAt: -1 }).limit(50)
    ]);

    const revenue = completedPaymentsCount * 100;

    // Agréger les titres pour l'IA
    const titles = recentCVs.map(cv => cv.title).filter(Boolean).join(", ");
    const templates = recentCVs.map(cv => cv.template).join(", ");

    const systemInstruction = `
Tu es l'analyste de données IA de "CVFacile", une application de création de CV.
Voici un extrait des données récentes de la plateforme:
- Nombre total d'utilisateurs: ${usersCount}
- Nombre total de CVs créés: ${cvsCount}
- Revenus totaux: ${revenue} FCFA
- Les titres des 50 derniers CVs créés: ${titles || 'Aucun'}
- Les modèles utilisés pour ces CVs: ${templates || 'Aucun'}

Ta tâche: Rédige un court paragraphe (3-4 phrases maximum) en français qui résume la santé de la plateforme et dégage 2 tendances intéressantes basées sur les titres professionnels et les modèles utilisés. Sois encourageant et professionnel. Ne mets pas de titre.
`;

    let text = "";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: systemInstruction }] }]
      });
      const response = await result.response;
      text = response.text();
    } catch (err: any) {
      if (err.status === 503 || err.message?.includes("503")) {
        console.log("gemini-2.5-flash saturé (503) pour insights, fallback vers gemini-2.0-flash...");
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const fallbackResult = await fallbackModel.generateContent({
          contents: [{ role: "user", parts: [{ text: systemInstruction }] }]
        });
        const fallbackResponse = await fallbackResult.response;
        text = fallbackResponse.text();
      } else {
        throw err;
      }
    }

    return NextResponse.json({ success: true, insights: text });
  } catch (error: any) {
    console.error("Erreur Admin AI Insights API:", error);
    if (error.status === 503 || error.message?.includes("503")) {
      return NextResponse.json(
        { error: "Le service IA est actuellement surchargé, veuillez réessayer plus tard." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Impossible de générer les insights IA pour le moment." },
      { status: 500 }
    );
  }
}
