"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import type { CVDocument } from "@/types/cv";

type TemplateProps = {
  cv: CVDocument;
};

export function PremiumTemplate({ cv }: TemplateProps) {
  const primaryColor = "#4F46E5";

  return (
    <div className="bg-white text-gray-900 font-sans relative text-[11pt]">
      <div className="grid grid-cols-3 min-h-[680px]">
        <div className="p-8 text-white flex flex-col justify-between" style={{ backgroundColor: primaryColor }}>
          <div>
            <h1 className="text-[24pt] leading-none font-bold">{cv.fullName || "Nom complet"}</h1>
            <p className="text-[14pt] opacity-90 mt-3">{cv.title || "Titre professionnel"}</p>
          </div>

          <div className="space-y-3 text-[10pt]">
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

          {cv.skills.length > 0 && (
            <div className="mt-8 pt-8 border-t border-white/30 break-inside-avoid">
              <h3 className="text-[14pt] font-bold mb-4">Compétences</h3>
              <div className="space-y-2">
                {cv.skills.slice(0, 6).map((skill, idx) => (
                  <p key={`${skill}-${idx}`} className="font-semibold text-[11pt]">
                    {skill}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-2 p-8">
          {cv.summary && (
            <div className="mb-8 break-inside-avoid">
              <p className="text-gray-700 leading-relaxed text-[11pt] whitespace-pre-wrap">{cv.summary}</p>
            </div>
          )}

          {cv.experiences.length > 0 && (
            <div className="mb-8">
              <h2 className="text-[18pt] font-bold mb-6 flex items-center gap-3">
                <span className="w-1 h-8 rounded-full" style={{ backgroundColor: primaryColor }} />
                Expériences
              </h2>
              <div className="space-y-6">
                {cv.experiences.map((exp, idx) => (
                  <div key={`${exp.company}-${idx}`} className="break-inside-avoid">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[14pt] font-bold text-gray-900">{exp.role || "Poste"}</h3>
                        <p className="font-semibold text-[12pt]" style={{ color: primaryColor }}>
                          {exp.company || "Entreprise"}
                        </p>
                      </div>
                      <span className="text-[10pt] text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {exp.startDate || "Début"} - {exp.endDate || "Fin"}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-2 leading-relaxed text-[11pt] whitespace-pre-wrap">{exp.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cv.education.length > 0 && (
            <div>
              <h2 className="text-[18pt] font-bold mb-6 flex items-center gap-3">
                <span className="w-1 h-8 rounded-full" style={{ backgroundColor: primaryColor }} />
                Formation
              </h2>
              <div className="space-y-4">
                {cv.education.map((edu, idx) => (
                  <div key={`${edu.school}-${idx}`} className="pb-4 border-b border-gray-200 last:border-b-0 break-inside-avoid">
                    <h3 className="font-bold text-gray-900 text-[14pt]">{edu.degree || "Diplôme"}</h3>
                    <p className="text-[12pt] text-gray-600">{edu.school || "Établissement"}</p>
                    <p className="text-[10pt] text-gray-500 mt-1">
                      {edu.startDate || "Début"} - {edu.endDate || "Fin"}
                    </p>
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
