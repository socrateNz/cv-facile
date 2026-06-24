import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "La clé API Gemini (GEMINI_API_KEY) n'est pas configurée." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { type, context, text } = body;

    let prompt = "";

    if (type === "summary") {
      prompt = `Tu es un expert en recrutement. Améliore ou rédige un résumé professionnel pour un CV à partir des informations suivantes :\n${context || "Aucune information supplémentaire"}\n${text ? `Texte actuel : ${text}` : ""}\n\nRédige un résumé percutant de 2 à 3 phrases maximum. Sois très concis. IMPORTANT : Ne renvoie QUE le texte du résumé, sans aucune introduction, sans politesse et sans guillemets.`;
    } else if (type === "experience") {
      prompt = `Tu es un expert en recrutement. Améliore ou rédige la description d'une expérience professionnelle pour un CV à partir des informations suivantes :\n${context || "Aucune information supplémentaire"}\n${text ? `Texte actuel : ${text}` : ""}\n\nRédige la description sous forme de tirets clairs. Limite-toi à 3 tirets (puces) maximum, très concis (une phrase courte par tiret). IMPORTANT : Ne renvoie QUE les tirets, aucune phrase d'introduction ni de conclusion, sans fioritures.`;
    } else {
      prompt = `Agis comme un assistant de rédaction pour CV. Voici la demande : ${text}. Sois très concis et direct, sans introduction.`;
    }

    let generatedText = "";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      generatedText = response.text();
    } catch (err: any) {
      if (err.status === 503) {
        console.log("gemini-2.5-flash indisponible (503), tentative avec gemini-1.5-flash...");
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const fallbackResult = await fallbackModel.generateContent(prompt);
        const fallbackResponse = await fallbackResult.response;
        generatedText = fallbackResponse.text();
      } else {
        throw err;
      }
    }

    return NextResponse.json({ success: true, data: generatedText.trim() });
  } catch (error: any) {
    console.error("Erreur Gemini API:", error);
    
    // Message personnalisé si l'erreur 503 persiste même avec le fallback
    if (error.status === 503 || error.message?.includes("503")) {
      return NextResponse.json(
        { error: "Le service d'intelligence artificielle est actuellement saturé. Veuillez réessayer dans quelques instants." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Une erreur est survenue lors de la génération." },
      { status: 500 }
    );
  }
}
