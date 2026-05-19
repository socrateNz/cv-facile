"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/header";
import { TemplateCardPreview } from "@/components/template-card-preview";
import { previewDataMap, templates } from "@/data/data";

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 pb-10">
      <div className="w-full bg-white pb-8">
        <Header />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200 w-fit p-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Choisissez votre modèle de CV
            </h1>
            <p className="text-gray-600 mt-1">
              {templates.length} modèles — comparez les styles en un coup d&apos;œil
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => {
            const previewData = previewDataMap[template.id];

            return (
              <article key={template.id} className="flex flex-col h-full">
                <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
                  <div className="relative bg-linear-to-br from-gray-50 to-blue-50/40 border-b border-gray-100 p-3 sm:p-4">
                    <span className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs font-medium text-gray-600 shadow-sm">
                      Aperçu
                    </span>
                    <TemplateCardPreview
                      cv={previewData}
                      TemplateComponent={template.component}
                    />
                  </div>

                  <div className="flex flex-col flex-1 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h2 className="text-lg font-bold text-gray-900">
                        {template.title}
                      </h2>
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {template.badge}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 flex-1">
                      {template.desc}
                    </p>
                    <Link
                      href={`/cv?template=${template.id}`}
                      className="block w-full text-center rounded-xl bg-linear-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-white font-medium text-sm hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                    >
                      Créer avec ce modèle
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-gray-500">
          Tous les modèles restent entièrement personnalisables après sélection.
        </p>
      </div>
    </main>
  );
}
