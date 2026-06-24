"use client";

import { useState } from "react";
import { Sparkles, Send, Loader2, Bot, User } from "lucide-react";

export default function AdminAIPage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: "Bonjour ! Je suis votre assistant IA dédié à l'administration de CVFacile. Comment puis-je vous aider aujourd'hui ? (Exemples: 'Rédige un email pour annoncer le nouveau design', 'Donne-moi 3 idées d'articles de blog SEO sur la recherche d'emploi').",
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMessage = prompt.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setPrompt("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur réseau");

      setMessages((prev) => [...prev, { role: "ai", text: data.text }]);
    } catch (error: any) {
      setMessages((prev) => [...prev, { role: "ai", text: `Erreur: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
          <Sparkles className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Centre de Commandement IA</h1>
          <p className="text-slate-400">Discutez avec l'IA pour générer du contenu marketing, SEO ou administratif.</p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col h-[600px] overflow-hidden">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "ai" ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-slate-700 text-slate-300"}`}>
                {msg.role === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-white/10 text-slate-200"}`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                <span className="text-sm text-slate-400">L'IA réfléchit...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-white/10 bg-slate-900/50">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Demandez à l'IA de rédiger un email, trouver des idées SEO..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="absolute right-2 p-2 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-indigo-500/20 disabled:hover:text-indigo-400"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
