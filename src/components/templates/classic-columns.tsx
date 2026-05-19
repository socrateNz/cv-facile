"use client";

import { Mail, Phone } from "lucide-react";
import type { CVDocument } from "@/types/cv";

type TemplateProps = {
  cv: CVDocument;
};

export function ClassicColumnsTemplate({ cv }: TemplateProps) {
  const primaryColor = "#1E3A8A";

  return (
    <div className="bg-white text-gray-900">
      <div className="grid md:grid-cols-3 min-h-[680px] border shadow-lg">
        {/* Sidebar gauche - informations personnelles */}
        <div className="bg-gray-900 text-gray-300 p-6">
          <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-3">
              <span className="text-3xl text-gray-400">{cv.fullName?.charAt(0) || "?"}</span>
            </div>
            <h1 className="text-xl font-bold text-white">{cv.fullName || "Nom complet"}</h1>
            <p className="text-sm mt-1" style={{ color: "#60A5FA" }}>{cv.title || "Titre"}</p>
          </div>

          <div className="space-y-4 text-sm">
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Contact</h3>
              {cv.email && (
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-3 h-3" />
                  <span className="text-xs">{cv.email}</span>
                </div>
              )}
              {cv.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  <span className="text-xs">{cv.phone}</span>
                </div>
              )}
            </div>

            {cv.skills.length > 0 && (
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Compétences clés</h3>
                <div className="space-y-1">
                  {cv.skills.slice(0, 8).map((skill, idx) => (
                    <p key={idx} className="text-xs">{skill}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar droite - contenu principal */}
        <div className="md:col-span-2 p-8 bg-white">
          {cv.summary && (
            <div className="mb-8">
              <h2 className="text-lg font-bold border-b-2 border-gray-200 pb-2 mb-3">À PROPOS</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{cv.summary}</p>
            </div>
          )}

          {cv.experiences.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold border-b-2 border-gray-200 pb-2 mb-4">EXPÉRIENCES</h2>
              <div className="space-y-5">
                {cv.experiences.map((exp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline flex-wrap gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{exp.role}</h3>
                        <p className="text-sm text-blue-800">{exp.company}</p>
                      </div>
                      <span className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{exp.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cv.education.length > 0 && (
            <div>
              <h2 className="text-lg font-bold border-b-2 border-gray-200 pb-2 mb-4">FORMATION</h2>
              <div className="space-y-4">
                {cv.education.map((edu, idx) => (
                  <div key={idx}>
                    <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-sm text-gray-600">{edu.school}</p>
                    <p className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}