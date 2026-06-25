import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
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

    const systemInstruction = `
Tu es l'Assistant IA exclusif pour l'Administrateur de "CVFacile", une plateforme web de création de CV au Cameroun. 
Ton rôle est d'aider l'admin à rédiger des emails marketing, des articles SEO, ou à analyser des stratégies.
Tu dois répondre en français de manière professionnelle, concise et orientée business.
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
