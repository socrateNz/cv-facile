"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import type { CVDocument } from "@/types/cv";

type TemplateProps = {
  cv: CVDocument;
};

export function ModernTemplate({ cv }: TemplateProps) {
  const primaryColor = "#4F46E5";

  return (
    <div className="bg-white text-gray-900 font-sans text-[11pt]">
      <div className="p-8 text-white" style={{ backgroundColor: primaryColor }}>
        <div className="flex gap-8 items-start max-w-5xl mx-auto">
          <div className="flex-1 pt-2">
            <h1 className="text-[28pt] leading-none font-bold">{cv.fullName || "Nom complet"}</h1>
            <p className="text-[16pt] opacity-90 mt-2">{cv.title || "Titre professionnel"}</p>
            <p className="mt-4 opacity-90 leading-relaxed max-w-2xl text-[11pt]">{cv.summary || "Résumé professionnel"}</p>

            <div className="flex flex-wrap gap-6 mt-6 text-[10pt]">
              {cv.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{cv.email}</span>
                </div>
              )}
              {cv.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{cv.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Cameroun</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-5xl mx-auto">
        {cv.experiences.length > 0 && (
          <div className="mb-12">
            <h2 className="text-[18pt] font-bold pb-3 border-b-4 mb-6" style={{ borderColor: primaryColor }}>
              Expériences Professionnelles
            </h2>
            <div className="space-y-6">
              {cv.experiences.map((exp, idx) => (
                <div key={`${exp.company}-${idx}`} className="border-l-4 pl-6 break-inside-avoid" style={{ borderColor: primaryColor }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-[14pt] font-bold text-gray-900">{exp.role || "Poste"}</h3>
                      <p className="text-[12pt] font-semibold" style={{ color: primaryColor }}>
                        {exp.company || "Entreprise"}
                      </p>
                    </div>
                    <span className="text-[10pt] text-gray-500 mt-1">
                      {exp.startDate || "Début"} - {exp.endDate || "Fin"}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-3 leading-relaxed text-[11pt]">{exp.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {cv.education.length > 0 && (
          <div className="mb-12">
            <h2 className="text-[18pt] font-bold pb-3 border-b-4 mb-6" style={{ borderColor: primaryColor }}>
              Formation
            </h2>
            <div className="space-y-4">
              {cv.education.map((edu, idx) => (
                <div key={`${edu.school}-${idx}`} className="border-l-4 pl-6 break-inside-avoid" style={{ borderColor: primaryColor }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-[14pt] font-bold text-gray-900">{edu.degree || "Diplôme"}</h3>
                      <p className="text-[12pt] text-gray-600">{edu.school || "Établissement"}</p>
                    </div>
                    <span className="text-[10pt] text-gray-500 mt-1">
                      {edu.startDate || "Début"} - {edu.endDate || "Fin"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {cv.skills.length > 0 && (
          <div className="break-inside-avoid">
            <h2 className="text-[18pt] font-bold pb-3 border-b-4 mb-6" style={{ borderColor: primaryColor }}>
              Compétences
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {cv.skills.map((skill, idx) => (
                <div key={`${skill}-${idx}`} className="break-inside-avoid">
                  <p className="font-semibold text-gray-900 mb-2 text-[11pt]">{skill}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
