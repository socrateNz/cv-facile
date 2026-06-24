"use client";

import { Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap } from "lucide-react";
import type { CVDocument } from "@/types/cv";

type TemplateProps = {
  cv: CVDocument;
};

export function ModernTimelineTemplate({ cv }: TemplateProps) {
  const primaryColor = "#EC4899";

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 text-[11pt] font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-visible">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-12 text-white">
          <div className="relative z-10">
            <h1 className="text-[28pt] leading-none font-bold mb-2">{cv.fullName || "Nom complet"}</h1>
            <p className="text-[16pt] opacity-90">{cv.title || "Titre professionnel"}</p>
            <div className="flex flex-wrap gap-4 mt-6 text-[10pt]">
              {cv.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4"/>{cv.email}</div>}
              {cv.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4"/>{cv.phone}</div>}
            </div>
          </div>
        </div>

        <div className="p-8">
          {cv.summary && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg break-inside-avoid">
              <p className="text-gray-700 italic leading-relaxed text-[11pt] whitespace-pre-wrap">{cv.summary}</p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {/* Colonne gauche */}
            <div className="space-y-6">
              {cv.skills.length > 0 && (
                <div className="break-inside-avoid">
                  <h3 className="text-[14pt] font-semibold mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 rounded-full bg-pink-500" />
                    Compétences
                  </h3>
                  <div className="space-y-2">
                    {cv.skills.map((skill, idx) => (
                      <div key={idx} className="break-inside-avoid">
                        <div className="flex justify-between text-[11pt] mb-1">
                          <span>{skill}</span>
                          <span className="text-gray-500 text-[10pt]">85%</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-pink-500 rounded-full" style={{ width: "85%" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Colonne droite */}
            <div className="md:col-span-2 space-y-8">
              {cv.experiences.length > 0 && (
                <div>
                  <h3 className="text-[16pt] font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-pink-500" />
                    Expériences professionnelles
                  </h3>
                  <div className="space-y-6">
                    {cv.experiences.map((exp, idx) => (
                      <div key={idx} className="relative pl-6 border-l-2 border-pink-200 break-inside-avoid">
                        <div className="absolute -left-[5px] top-0 w-2 h-2 bg-pink-500 rounded-full" />
                        <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                          <div>
                            <h4 className="font-semibold text-[14pt] text-gray-900">{exp.role}</h4>
                            <p className="text-[12pt] text-pink-600">{exp.company}</p>
                          </div>
                          <span className="text-[10pt] text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {exp.startDate} - {exp.endDate}
                          </span>
                        </div>
                        <p className="text-[11pt] text-gray-600 mt-2 whitespace-pre-wrap">{exp.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cv.education.length > 0 && (
                <div>
                  <h3 className="text-[16pt] font-semibold mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-pink-500" />
                    Formation
                  </h3>
                  <div className="space-y-4">
                    {cv.education.map((edu, idx) => (
                      <div key={idx} className="flex gap-4 break-inside-avoid">
                        <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <h4 className="font-semibold text-[14pt]">{edu.degree}</h4>
                          <p className="text-[12pt] text-gray-600">{edu.school}</p>
                          <p className="text-[10pt] text-gray-500">{edu.startDate} - {edu.endDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}