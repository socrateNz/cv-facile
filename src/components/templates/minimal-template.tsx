"use client";

import { Mail, Phone } from "lucide-react";
import type { CVDocument } from "@/types/cv";

type TemplateProps = {
  cv: CVDocument;
};

export function MinimalTemplate({ cv }: TemplateProps) {
  const primaryColor = "#10B981";

  return (
    <div className="max-w-4xl mx-auto bg-white text-gray-800">
      {/* Header avec photo */}
      <div className="flex gap-8 p-8 border-b-2" style={{ borderColor: primaryColor }}>
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-4xl font-light text-gray-400">
            {cv.fullName?.charAt(0) || "?"}
          </span>
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-light tracking-tight">{cv.fullName || "Nom complet"}</h1>
          <p className="text-xl mt-2" style={{ color: primaryColor }}>{cv.title || "Titre"}</p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
            {cv.email && <div className="flex items-center gap-1"><Mail className="w-4 h-4"/>{cv.email}</div>}
            {cv.phone && <div className="flex items-center gap-1"><Phone className="w-4 h-4"/>{cv.phone}</div>}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-8">
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-1 space-y-6">
            {cv.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Compétences</h3>
                <div className="flex flex-wrap gap-2">
                  {cv.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 text-sm bg-gray-100 rounded-full">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-2 space-y-8">
            {cv.summary && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Profil</h3>
                <p className="text-gray-700 leading-relaxed">{cv.summary}</p>
              </div>
            )}

            {cv.experiences.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Expériences</h3>
                <div className="space-y-4">
                  {cv.experiences.map((exp, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-semibold">{exp.role || "Poste"}</h4>
                        <span className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{exp.company}</p>
                      <p className="text-sm text-gray-700 mt-2">{exp.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}