"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import type { CVDocument } from "@/types/cv";

type TemplateProps = {
  cv: CVDocument;
};

export function ClassicTemplate({ cv }: TemplateProps) {
  const [firstName, ...rest] = cv.fullName.trim().split(" ");
  const lastName = rest.join(" ");

  return (
    <div className="p-8 max-w-4xl mx-auto font-serif text-gray-900 bg-white text-[11pt]">
      <div className="border-b-2 border-gray-900 pb-6 mb-6">
        <h1 className="text-[28pt] leading-none font-bold text-gray-900">
          {firstName || "Prénom"} {lastName || "Nom"}
        </h1>
        <p className="text-[16pt] text-gray-600 mt-2">{cv.title || "Titre professionnel"}</p>

        <div className="flex flex-wrap gap-4 mt-4 text-[10pt] text-gray-700">
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

      {cv.summary && (
        <div className="mb-8 break-inside-avoid">
          <p className="text-gray-700 leading-relaxed text-[11pt] whitespace-pre-wrap">{cv.summary}</p>
        </div>
      )}

      {cv.experiences.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[18pt] font-bold text-gray-900 border-b-2 border-gray-300 pb-2 mb-4">
            Expériences Professionnelles
          </h2>
          <div className="space-y-6">
            {cv.experiences.map((exp, idx) => (
              <div key={`${exp.company}-${idx}`} className="break-inside-avoid">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[14pt] font-bold text-gray-900">{exp.role || "Poste"}</h3>
                    <p className="text-[12pt] text-gray-600 font-semibold">{exp.company || "Entreprise"}</p>
                  </div>
                  <span className="text-[10pt] text-gray-500 mt-1">
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
        <div className="mb-8">
          <h2 className="text-[18pt] font-bold text-gray-900 border-b-2 border-gray-300 pb-2 mb-4">
            Formation
          </h2>
          <div className="space-y-4">
            {cv.education.map((edu, idx) => (
              <div key={`${edu.school}-${idx}`} className="break-inside-avoid">
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
          <h2 className="text-[18pt] font-bold text-gray-900 border-b-2 border-gray-300 pb-2 mb-4">Compétences</h2>
          <div className="grid grid-cols-2 gap-4">
            {cv.skills.map((skill, idx) => (
              <div key={`${skill}-${idx}`} className="text-gray-700 text-[11pt] break-inside-avoid">
                <p className="font-semibold">{skill}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
