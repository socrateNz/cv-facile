"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Header } from "@/components/header";
import { TemplateCardPreview } from "@/components/template-card-preview";
import { previewDataMap, templates } from "@/data/data";

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans antialiased overflow-hidden selection:bg-indigo-500/30 flex flex-col">
      {/* ── BACKGROUND ANIMATIONS ── */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full pb-8">
        <Header />
      </div>

      <main className="relative z-10 flex-1 mx-auto w-full max-w-7xl px-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-12">
          <Link
            href="/"
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-medium text-indigo-200">Étape 1 sur 3</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Choisissez votre modèle de CV
            </h1>
            <p className="text-slate-400 mt-2">
              {templates.length} modèles professionnels prêts à l'emploi. Vous pourrez en changer à tout moment.
            </p>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3 perspective-1000">
          {templates.map((template) => {
            const previewData = previewDataMap[template.id];

            return (
              <article key={template.id} className="group relative flex flex-col h-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:border-indigo-500/30 hover:shadow-[0_10px_40px_rgba(99,102,241,0.15)]">
                <div className="relative bg-slate-900/50 border-b border-white/10 p-4">
                  <span className="absolute top-4 right-4 z-10 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-xs font-bold text-white shadow-lg">
                    Aperçu
                  </span>
                  {/* We wrap the preview in a white container to show the real CV colors */}
                  <div className="bg-white rounded-xl overflow-hidden shadow-inner shadow-slate-950">
                    <TemplateCardPreview
                      cv={previewData}
                      TemplateComponent={template.component}
                    />
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h2 className="text-xl font-bold text-white">
                      {template.title}
                    </h2>
                    <span className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {template.badge}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-6 flex-1 leading-relaxed">
                    {template.desc}
                  </p>
                  <Link
                    href={`/cv?template=${template.id}`}
                    className="block w-full text-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-white font-bold text-sm hover:from-indigo-400 hover:to-purple-500 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-[1.02]"
                  >
                    Utiliser ce modèle
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
