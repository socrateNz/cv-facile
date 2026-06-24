"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Dialog } from "@/components/dialog";

interface AIAssistantButtonProps {
  type: "summary" | "experience";
  context?: string;
  currentText?: string;
  onApply: (text: string) => void;
  className?: string;
}

export function AIAssistantButton({
  type,
  context = "",
  currentText = "",
  onApply,
  className = "",
}: AIAssistantButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, context, text: currentText }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setGeneratedText(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!generatedText) {
      handleGenerate();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all ${className}`}
        title="Améliorer avec l'IA (Gemini)"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Améliorer avec l'IA</span>
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Assistant IA (Gemini)"
      >
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-sm text-gray-500">L'IA rédige une proposition...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
              <div className="mt-4">
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded text-red-700 text-xs font-medium transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-sm text-slate-800 whitespace-pre-wrap">
                  {generatedText}
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Générer une autre version
                </button>
                <button
                  onClick={() => {
                    onApply(generatedText);
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
                >
                  Appliquer
                </button>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}
