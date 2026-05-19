"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultCV } from "@/lib/defaults";
import { CVDocument } from "@/types/cv";
import { ScaledCVPreview } from "@/components/scaled-cv-preview";
import { Dialog } from "@/components/dialog";
import {
  User,
  Briefcase,
  Code2,
  GraduationCap,
  Check,
  ChevronLeft,
  ChevronRight,
  Save,
  Upload,
  Phone,
  Mail,
  UserCircle,
  X,
  Plus,
  Trash2,
  Sparkles,
  CreditCard,
  Loader2,
  FileText,
  Layout,
} from "lucide-react";
import { PaymentModal } from "@/components/payment-modal";
import { normalizeTemplate } from "@/lib/utils";
import { TEMPLATE_IDS, templates } from "@/data/data";

const experienceTips = [
  "J'ai piloté des projets avec un gain mesurable de performance.",
  "J'ai amélioré les processus en réduisant les délais de livraison.",
  "J'ai collaboré avec des équipes pluridisciplinaires pour atteindre les objectifs.",
];

const steps = [
  { id: "infos", label: "Infos", icon: User },
  { id: "summary", label: "Résumé", icon: FileText },
  { id: "experiences", label: "Expériences", icon: Briefcase },
  { id: "competences", label: "Compétences", icon: Code2 },
  { id: "education", label: "Éducation", icon: GraduationCap },
  { id: "template", label: "Modèle", icon: Layout },
  { id: "payment", label: "Paiement", icon: CreditCard },
];

type Props = {
  initialTemplate?: CVDocument["template"];
  existingCvId?: string;
  initialStep?: number;
  openPaymentOnLoad?: boolean;
};

export function CVBuilder({
  initialTemplate = "modern",
  existingCvId = "",
  initialStep = 0,
  openPaymentOnLoad = false,
}: Props) {
  const [cv, setCv] = useState<CVDocument>({
    ...defaultCV,
    template: normalizeTemplate(initialTemplate),
  });
  const [currentStep, setCurrentStep] = useState(
    Math.min(Math.max(initialStep, 0), steps.length - 1),
  );
  const [cvId, setCvId] = useState(existingCvId);
  const [isSaving, setIsSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [paymentDone, setPaymentDone] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const experienceTip = useMemo(() => experienceTips[0], []);

  const canGoNext = useMemo(() => {
    if (currentStep === 0) {
      return (
        cv.fullName.trim() &&
        cv.title.trim() &&
        cv.email.trim() &&
        (cv.phone || "").trim()
      );
    }
    return true;
  }, [currentStep, cv.fullName, cv.title, cv.email, cv.phone]);

  useEffect(() => {
    if (!existingCvId) return;
    fetch(`/api/cv/${existingCvId}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (payload?.data) {
          setCv(payload.data);
          if (payload.data.status === "ready" || payload.data.status === "published") {
            setIsReady(true);
          }
        }
      });
  }, [existingCvId]);

  useEffect(() => {
    if (openPaymentOnLoad && cvId) {
      setCurrentStep(steps.length - 1);
    }
  }, [openPaymentOnLoad, cvId]);

  useEffect(() => {
    if (existingCvId) return;
    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!payload?.data) return;
        setCv((prev) => ({
          ...prev,
          fullName: prev.fullName || payload.data.fullName || "",
          email: prev.email || payload.data.email || "",
        }));
      });
  }, [existingCvId]);

  async function saveCV() {
    setIsSaving(true);
    const url = cvId ? `/api/cv/${cvId}` : "/api/cv";
    const method = cvId ? "PUT" : "POST";
    const payloadToSave = {
      ...cv,
      template: normalizeTemplate(cv.template),
    };
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadToSave),
    });
    const payload = await response.json();
    if (!cvId) setCvId(payload.data._id);
    setIsSaving(false);
  }

  async function finalizeCV() {
    setIsSaving(true);
    const url = cvId ? `/api/cv/${cvId}` : "/api/cv";
    const method = cvId ? "PUT" : "POST";
    const payloadToSave = {
      ...cv,
      template: normalizeTemplate(cv.template),
      status: "ready" as const,
    };
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadToSave),
    });
    const payload = await response.json();
    if (!cvId) setCvId(payload.data._id);
    setIsSaving(false);

    if (response.ok) {
      setIsReady(true);
      setShowPaymentModal(true);
    } else {
      setDialogMessage("Erreur lors de la finalisation du CV.");
    }
  }

  async function uploadPhoto(file: File) {
    setIsUploading(true);
    const form = new FormData();
    form.set("image", file);
    const response = await fetch("/api/upload", { method: "POST", body: form });

    if (!response.ok) {
      let message = "Upload photo impossible.";
      try {
        const payload = await response.json();
        message = payload?.message || message;
      } catch {
        const text = await response.text();
        if (text) message = text;
      }
      setDialogMessage(message);
      setIsUploading(false);
      return;
    }

    const payload = await response.json();
    setCv((prev) => ({ ...prev, photoUrl: payload.data.url }));
    setIsUploading(false);
  }

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header avec progression */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Créateur de CV
              </h1>
              <p className="text-gray-600 mt-1">
                Remplissez vos informations en toute simplicité
              </p>
            </div>
            <button
              onClick={saveCV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Sauvegarder</span>
            </button>
          </div>

          {/* Steps */}
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
            <div className="relative flex justify-between">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;

                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(idx)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div
                      className={`
                      relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                      ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg scale-110"
                          : isCompleted
                            ? "bg-green-500"
                            : "bg-white border-2 border-gray-300 hover:border-blue-400"
                      }
                    `}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <Icon
                          className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500"}`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium transition-colors duration-200 ${
                        isActive
                          ? "text-blue-600"
                          : isCompleted
                            ? "text-green-600"
                            : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Formulaire */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <StepIcon className="w-5 h-5 text-white" />
                  <h2 className="text-white font-semibold">
                    {steps[currentStep].label}
                  </h2>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {currentStep === 0 && (
                  <>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                        placeholder="Nom complet"
                        value={cv.fullName}
                        onChange={(e) =>
                          setCv({ ...cv, fullName: e.target.value })
                        }
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                        placeholder="Email (obligatoire)"
                        type="email"
                        value={cv.email}
                        onChange={(e) =>
                          setCv({ ...cv, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                        placeholder="Numéro de téléphone (ex: +237 6XX XXX XXX)"
                        type="tel"
                        value={cv.phone || ""}
                        onChange={(e) =>
                          setCv({ ...cv, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                        placeholder="Titre professionnel"
                        value={cv.title}
                        onChange={(e) =>
                          setCv({ ...cv, title: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}

                {currentStep === 1 && (
                  <textarea
                    className="w-full rounded-xl border border-gray-200 p-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    placeholder="Décrivez votre parcours, vos forces et vos objectifs..."
                    rows={8}
                    value={cv.summary}
                    onChange={(e) => setCv({ ...cv, summary: e.target.value })}
                  />
                )}

                {currentStep === 2 && (
                  <>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {cv.experiences.map((exp, idx) => (
                        <div
                          key={`exp-${idx}`}
                          className="relative rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 group"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setCv((prev) => ({
                                ...prev,
                                experiences: prev.experiences.filter(
                                  (_, i) => i !== idx,
                                ),
                              }))
                            }
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                          </button>
                          <div className="space-y-3">
                            <input
                              className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                              placeholder="Entreprise"
                              value={exp.company}
                              onChange={(e) =>
                                setCv((prev) => ({
                                  ...prev,
                                  experiences: prev.experiences.map(
                                    (item, itemIdx) =>
                                      itemIdx === idx
                                        ? { ...item, company: e.target.value }
                                        : item,
                                  ),
                                }))
                              }
                            />
                            <input
                              className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                              placeholder="Poste"
                              value={exp.role}
                              onChange={(e) =>
                                setCv((prev) => ({
                                  ...prev,
                                  experiences: prev.experiences.map(
                                    (item, itemIdx) =>
                                      itemIdx === idx
                                        ? { ...item, role: e.target.value }
                                        : item,
                                  ),
                                }))
                              }
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                                type="month"
                                placeholder="Début"
                                value={exp.startDate}
                                onChange={(e) =>
                                  setCv((prev) => ({
                                    ...prev,
                                    experiences: prev.experiences.map(
                                      (item, itemIdx) =>
                                        itemIdx === idx
                                          ? {
                                              ...item,
                                              startDate: e.target.value,
                                            }
                                          : item,
                                    ),
                                  }))
                                }
                              />
                              <input
                                className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                                type="month"
                                placeholder="Fin"
                                value={exp.endDate}
                                onChange={(e) =>
                                  setCv((prev) => ({
                                    ...prev,
                                    experiences: prev.experiences.map(
                                      (item, itemIdx) =>
                                        itemIdx === idx
                                          ? { ...item, endDate: e.target.value }
                                          : item,
                                    ),
                                  }))
                                }
                              />
                            </div>
                            <textarea
                              className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                              placeholder="Description"
                              rows={2}
                              value={exp.summary}
                              onChange={(e) =>
                                setCv((prev) => ({
                                  ...prev,
                                  experiences: prev.experiences.map(
                                    (item, itemIdx) =>
                                      itemIdx === idx
                                        ? { ...item, summary: e.target.value }
                                        : item,
                                  ),
                                }))
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Astuce
                          </p>
                          <p className="text-sm text-gray-600">
                            {experienceTip}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setCv((prev) => ({
                          ...prev,
                          experiences: [
                            ...prev.experiences,
                            {
                              company: "",
                              role: "",
                              startDate: "",
                              endDate: "",
                              summary: "",
                            },
                          ],
                        }))
                      }
                      className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-3 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter une expérience
                    </button>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 rounded-xl border border-gray-200 p-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                        placeholder="Ajouter une compétence"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && skillInput.trim()) {
                            setCv((prev) => ({
                              ...prev,
                              skills: [...prev.skills, skillInput.trim()],
                            }));
                            setSkillInput("");
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = skillInput.trim();
                          if (!next) return;
                          setCv((prev) => ({
                            ...prev,
                            skills: [...prev.skills, next],
                          }));
                          setSkillInput("");
                        }}
                        className="px-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all duration-200"
                      >
                        Ajouter
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 min-h-[100px]">
                      {cv.skills.map((skill, idx) => (
                        <button
                          key={`${skill}-${idx}`}
                          type="button"
                          onClick={() =>
                            setCv((prev) => ({
                              ...prev,
                              skills: prev.skills.filter(
                                (_, skillIdx) => skillIdx !== idx,
                              ),
                            }))
                          }
                          className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 text-sm text-gray-700 hover:from-red-100 hover:to-red-100 transition-all duration-200"
                        >
                          {skill}
                          <X className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>

                  </>
                )}

                {currentStep === 4 && (
                  <>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {cv.education.map((edu, idx) => (
                        <div
                          key={`edu-${idx}`}
                          className="relative rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 group"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setCv((prev) => ({
                                ...prev,
                                education: prev.education.filter(
                                  (_, i) => i !== idx,
                                ),
                              }))
                            }
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                          </button>
                          <div className="space-y-3">
                            <input
                              className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-blue-400"
                              placeholder="Établissement"
                              value={edu.school}
                              onChange={(e) =>
                                setCv((prev) => ({
                                  ...prev,
                                  education: prev.education.map(
                                    (item, itemIdx) =>
                                      itemIdx === idx
                                        ? { ...item, school: e.target.value }
                                        : item,
                                  ),
                                }))
                              }
                            />
                            <input
                              className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-blue-400"
                              placeholder="Diplôme"
                              value={edu.degree}
                              onChange={(e) =>
                                setCv((prev) => ({
                                  ...prev,
                                  education: prev.education.map(
                                    (item, itemIdx) =>
                                      itemIdx === idx
                                        ? { ...item, degree: e.target.value }
                                        : item,
                                  ),
                                }))
                              }
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                                type="month"
                                placeholder="Début"
                                value={edu.startDate}
                                onChange={(e) =>
                                  setCv((prev) => ({
                                    ...prev,
                                    education: prev.education.map(
                                      (item, itemIdx) =>
                                        itemIdx === idx
                                          ? {
                                              ...item,
                                              startDate: e.target.value,
                                            }
                                          : item,
                                    ),
                                  }))
                                }
                              />
                              <input
                                className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                                type="month"
                                placeholder="Fin"
                                value={edu.endDate}
                                onChange={(e) =>
                                  setCv((prev) => ({
                                    ...prev,
                                    education: prev.education.map(
                                      (item, itemIdx) =>
                                        itemIdx === idx
                                          ? { ...item, endDate: e.target.value }
                                          : item,
                                    ),
                                  }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setCv((prev) => ({
                          ...prev,
                          education: [
                            ...prev.education,
                            {
                              school: "",
                              degree: "",
                              startDate: "",
                              endDate: "",
                            },
                          ],
                        }))
                      }
                      className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-3 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter une formation
                    </button>
                  </>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Modèle de CV
                      </label>
                      <select
                        className="w-full rounded-xl border border-gray-200 p-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                        value={cv.template}
                        onChange={(e) =>
                          setCv({
                            ...cv,
                            template: normalizeTemplate(e.target.value),
                          })
                        }
                      >
                        {TEMPLATE_IDS.map((id) => (
                          <option key={id} value={id}>
                            {templates.find((t) => t.id === id)?.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Photo de profil
                      </label>
                      <div className="flex items-center gap-4">
                        {cv.photoUrl ? (
                          <div className="relative">
                            <img
                              src={cv.photoUrl}
                              alt="Profile"
                              className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
                            />
                            <button
                              onClick={() =>
                                setCv({ ...cv, photoUrl: undefined })
                              }
                              className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                            <Upload className="w-4 h-4" />
                            <span className="text-sm">Choisir une photo</span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadPhoto(file);
                              }}
                            />
                          </label>
                        )}
                        {isUploading && (
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 text-center">
                      L&apos;aperçu à droite se met à jour selon le modèle choisi.
                    </p>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="space-y-6">
                    {paymentDone ? (
                      <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-6 text-center space-y-3">
                        <Check className="w-10 h-10 text-green-600 mx-auto" />
                        <p className="font-bold text-green-800">Paiement confirmé</p>
                        {cvId && (
                          <a
                            href={`/api/cv/${cvId}/pdf`}
                            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-white text-sm font-semibold"
                          >
                            Télécharger le PDF
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 p-6 text-center space-y-4">
                        <CreditCard className="w-12 h-12 text-blue-600 mx-auto" />
                        <p className="font-semibold text-gray-900">
                          Paiement Mobile Money — 500 FCFA
                        </p>
                        <button
                          type="button"
                          onClick={async () => {
                            await saveCV();
                            if (!cvId) {
                              setDialogMessage("Enregistrez le CV avant de payer.");
                              return;
                            }
                            if (!isReady) await finalizeCV();
                            else setShowPaymentModal(true);
                          }}
                          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-white font-semibold"
                        >
                          {isReady ? "Payer maintenant" : "Finaliser et payer"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex justify-between">
                <button
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-2 text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 disabled:opacity-50"
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                  type="button"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Retour
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-white font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                    disabled={!canGoNext}
                    onClick={() =>
                      setCurrentStep((s) => Math.min(steps.length - 1, s + 1))
                    }
                    type="button"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-2 text-white font-medium hover:shadow-lg transition-all duration-200"
                    onClick={finalizeCV}
                    disabled={isSaving}
                    type="button"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Finaliser
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-3">
                <p className="text-white text-sm font-medium text-center">
                  Aperçu en temps réel
                </p>
              </div>
              <ScaledCVPreview cv={cv} variant="panel" />
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        cvId={cvId}
        customerEmail={cv.email}
        onSuccess={() => {
          setPaymentDone(true);
          setShowPaymentModal(false);
        }}
      />

      <Dialog
        isOpen={!!dialogMessage}
        title="Information"
        description={dialogMessage || ""}
        onClose={() => setDialogMessage(null)}
        buttons={[
          {
            label: "Fermer",
            onClick: () => setDialogMessage(null),
            variant: "default",
          },
        ]}
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
