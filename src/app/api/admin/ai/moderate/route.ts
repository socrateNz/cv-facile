import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectToDatabase } from "@/lib/mongodb";
import { CVModel } from "@/models/CV";
import { assertRole, getSessionUser } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const session = getSessionUser(req as any);
    if (!session || !assertRole(session.role, "admin")) {
      return NextResponse.json({ message: "Accès admin requis." }, { status: 403 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "La clé API Gemini n'est pas configurée." }, { status: 500 });
    }

    const { cvId } = await req.json();
    if (!cvId) return NextResponse.json({ error: "Aucun CV ID fourni." }, { status: 400 });

    await connectToDatabase();
    const cv = await CVModel.findById(cvId);
    
    if (!cv) {
      return NextResponse.json({ error: "CV introuvable." }, { status: 404 });
    }

    const cvData = `
    Nom: ${cv.fullName}
    Titre: ${cv.title}
    Résumé: ${cv.summary}
    Expériences: ${cv.experiences?.map((e: any) => e.role + " chez " + e.company + ": " + e.summary).join("\n")}
    Formations: ${cv.education?.map((e: any) => e.degree + " à " + e.school).join("\n")}
    Compétences: ${cv.skills?.join(", ")}
    `;

    const systemInstruction = `
Tu es un modérateur IA pour une plateforme de création de CV sérieuse.
Examine le CV suivant et détermine s'il contient du contenu inapproprié (insultes, haine, spam manifeste, charabia total sans aucun sens).
Réponds au format JSON strict avec deux champs :
- status : "sain" (si le CV semble normal, même s'il est vide ou très basique) ou "suspect" (si tu détectes un problème grave).
- reason : Si suspect, donne une très courte raison (ex: "Contient des insultes", "Charabia complet"). Si sain, renvoie "".

Voici le CV :
${cvData}
`;

    let data;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: systemInstruction }] }],
        generationConfig: { responseMimeType: "application/json" }
      });
      const response = await result.response;
      data = JSON.parse(response.text());
    } catch (err: any) {
      if (err.status === 503 || err.message?.includes("503")) {
        console.log("gemini-2.5-flash saturé (503) pour la modération, fallback vers gemini-2.0-flash...");
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const fallbackResult = await fallbackModel.generateContent({
          contents: [{ role: "user", parts: [{ text: systemInstruction }] }],
          generationConfig: { responseMimeType: "application/json" }
        });
        const fallbackResponse = await fallbackResult.response;
        data = JSON.parse(fallbackResponse.text());
      } else {
        throw err;
      }
    }

    return NextResponse.json({ success: true, result: data });
  } catch (error: any) {
    console.error("Erreur Admin AI Moderation API:", error);
    if (error.status === 503 || error.message?.includes("503")) {
      return NextResponse.json({ error: "Le service IA est temporairement indisponible (Surcharge)." }, { status: 503 });
    }
    return NextResponse.json({ error: "Une erreur est survenue lors de la modération." }, { status: 500 });
  }
}
