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

    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Aucun texte fourni." }, { status: 400 });
    }

    const prompt = `Tu es un assistant expert en création de CV. Ton objectif est d'extraire toutes les informations pertinentes du texte fourni par l'utilisateur et de les organiser dans un format JSON strict.

Voici le schéma JSON attendu. Si une information est absente du texte, laisse une chaîne vide "" ou un tableau vide []. Les dates doivent être au format "YYYY-MM" (par exemple "2023-01") si possible.

{
  "fullName": "Le nom complet",
  "email": "Adresse email",
  "phone": "Numéro de téléphone",
  "title": "Titre professionnel",
  "summary": "Un court résumé professionnel de 2-3 phrases tiré du texte",
  "skills": ["Compétence 1", "Compétence 2"],
  "experiences": [
    {
      "company": "Nom de l'entreprise",
      "role": "Titre du poste",
      "startDate": "Date de début (YYYY-MM)",
      "endDate": "Date de fin (YYYY-MM) ou vide si en cours",
      "summary": "Description très concise du poste (1 à 3 phrases courtes max, ou des tirets séparés par des sauts de ligne si pertinent)"
    }
  ],
  "education": [
    {
      "school": "Nom de l'établissement",
      "degree": "Diplôme ou formation",
      "startDate": "Date de début (YYYY-MM)",
      "endDate": "Date de fin (YYYY-MM)"
    }
  ]
}

IMPORTANT:
- Renvoie UNIQUEMENT le JSON brut, sans le formater dans un bloc markdown (\`\`\`json). 
- Le JSON doit être valide et pouvoir être parsé directement par JSON.parse().
- Ne rajoute pas d'introduction ni de conclusion.

Voici le texte de l'utilisateur :
"""
${text}
"""
`;

    let generatedText = "";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      });
      const response = await result.response;
      generatedText = response.text();
    } catch (err: any) {
      if (err.status === 503) {
        console.log("gemini-2.5-flash indisponible (503), tentative avec gemini-1.5-flash...");
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const fallbackResult = await fallbackModel.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        });
        const fallbackResponse = await fallbackResult.response;
        generatedText = fallbackResponse.text();
      } else {
        throw err;
      }
    }

    // Le modèle Gemini configuré avec responseMimeType="application/json" devrait nous renvoyer un JSON brut.
    const data = JSON.parse(generatedText.trim());

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Erreur Gemini Import API:", error);
    
    if (error.status === 503 || error.message?.includes("503")) {
      return NextResponse.json(
        { error: "Le service d'intelligence artificielle est actuellement saturé. Veuillez réessayer dans quelques instants." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'analyse du texte. Veuillez vérifier le format." },
      { status: 500 }
    );
  }
}
