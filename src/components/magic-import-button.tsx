"use client";

import { useState } from "react";
import { Sparkles, Loader2, UploadCloud } from "lucide-react";
import { Dialog } from "@/components/dialog";

interface MagicImportButtonProps {
  onImport: (data: any) => void;
  className?: string;
}

export function MagicImportButton({ onImport, className = "" }: MagicImportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!text.trim()) {
      setError("Veuillez coller un texte à analyser.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Une erreur est survenue lors de l'importation.");
      }

      onImport(result.data);
      setIsOpen(false);
      setText("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-300 hover:scale-105 ${className}`}
        title="Générer un CV depuis un texte"
      >
        <Sparkles className="w-4 h-4" />
        <span>Import Magique IA</span>
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Générer avec l'IA"
        description="Collez votre biographie, profil LinkedIn ou brouillon ci-dessous. L'IA s'occupe de remplir tous les champs de votre CV !"
      >
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 bg-slate-50 rounded-xl border border-slate-200">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-sm font-medium text-slate-600">Lecture et analyse de votre parcours...</p>
              <p className="text-xs text-slate-400">Cela peut prendre quelques secondes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
                  {error}
                </div>
              )}
              <textarea
                className="w-full rounded-xl border border-gray-300 p-4 text-sm text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all min-h-[200px]"
                placeholder="Exemple: Je m'appelle Alex Dupont. Je suis développeur Full Stack depuis 5 ans. J'ai travaillé chez TechCorp de 2020 à 2023 où j'ai créé des APIs en Node.js. Avant cela, j'étais chez WebSolutions. J'ai un master de l'Université de Lyon (2018-2020). Mes compétences sont React, Node.js, et MongoDB. Voici mon numéro: 0612345678."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleImport}
                  disabled={!text.trim()}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UploadCloud className="w-4 h-4" />
                  Générer mon CV
                </button>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}
