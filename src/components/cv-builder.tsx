"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  Loader2,
  FileText,
  Layout,
  Download,
  CreditCard,
} from "lucide-react";
import { PaymentModal } from "@/components/payment-modal";
import { SaveAccountCta } from "@/components/save-account-cta";
import { LOCAL_CV_KEY } from "@/lib/guest-constants";
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

const jsonHeaders = { "Content-Type": "application/json" };
const fetchOpts = { credentials: "include" as const };

type Props = {
  initialTemplate?: CVDocument["template"];
  existingCvId?: string;
  initialStep?: number;
  openPaymentOnLoad?: boolean;
  paymentAmount?: number;
  paymentCurrency?: string;
};

export function CVBuilder({
  initialTemplate = "modern",
  existingCvId = "",
  initialStep = 0,
  openPaymentOnLoad = false,
  paymentAmount = 500,
  paymentCurrency = "XAF",
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
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
    fetch(`/api/cv/${existingCvId}`, fetchOpts)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (payload?.data) {
          setCv(payload.data);
          if (payload.data.status === "ready" || payload.data.status === "published") {
            setIsReady(true);
          }
        }
      })
      .then(() => {
        if (existingCvId) checkPaymentStatus(existingCvId);
      });
  }, [existingCvId]);

  async function checkPaymentStatus(id: string) {
    const res = await fetch(`/api/cv/${id}/payment-status`, fetchOpts);
    if (!res.ok) return;
    const payload = await res.json();
    if (payload?.data?.isPaid) setPaymentDone(true);
  }

  useEffect(() => {
    if (cvId) checkPaymentStatus(cvId);
  }, [cvId]);

  useEffect(() => {
    if (openPaymentOnLoad && cvId) {
      setCurrentStep(steps.length - 1);
      setIsReady(true);
      if (!paymentDone) setShowPaymentModal(true);
    }
  }, [openPaymentOnLoad, cvId, paymentDone]);

  useEffect(() => {
    if (existingCvId) return;
    fetch("/api/auth/me", fetchOpts)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!payload?.data) return;
        setIsLoggedIn(true);
        setCv((prev) => ({
          ...prev,
          fullName: prev.fullName || payload.data.fullName || "",
          email: prev.email || payload.data.email || "",
        }));
      });
  }, [existingCvId]);

  useEffect(() => {
    if (existingCvId || cvId) return;
    const stored = typeof window !== "undefined" ? localStorage.getItem(LOCAL_CV_KEY) : null;
    if (!stored) return;
    fetch(`/api/cv/${stored}`, fetchOpts)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (payload?.data) {
          setCv(payload.data);
          setCvId(stored);
        }
      });
  }, [existingCvId, cvId]);

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
      ...fetchOpts,
      headers: jsonHeaders,
      body: JSON.stringify(payloadToSave),
    });
    const payload = await response.json();
    if (payload?.data?._id) {
      setCvId(payload.data._id);
      localStorage.setItem(LOCAL_CV_KEY, payload.data._id);
    }
    setIsSaving(false);
    return response.ok;
  }

  async function finalizeCV(): Promise<string | null> {
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
      ...fetchOpts,
      headers: jsonHeaders,
      body: JSON.stringify(payloadToSave),
    });
    const payload = await response.json();
    setIsSaving(false);

    if (response.ok && payload?.data?._id) {
      const id = String(payload.data._id);
      setCvId(id);
      localStorage.setItem(LOCAL_CV_KEY, id);
      setIsReady(true);
      setCurrentStep(steps.length - 1);
      if (!paymentDone) setShowPaymentModal(true);
      else checkPaymentStatus(id);
      return id;
    }

    setDialogMessage(payload?.message || "Erreur lors de la finalisation du CV.");
    return null;
  }

  async function downloadPdf() {
    let id = cvId;
    if (!id) {
      id = (await finalizeCV()) || "";
    }
    if (!id) {
      setDialogMessage("Enregistrez le CV avant de télécharger.");
      return;
    }
    setIsDownloading(true);
    try {
      window.open(`/api/cv/${id}/pdf`, "_blank");
    } finally {
      setIsDownloading(false);
    }
  }

  async function uploadPhoto(file: File) {
    setIsUploading(true);
    const form = new FormData();
    form.set("image", file);
    const response = await fetch("/api/upload", { method: "POST", body: form, ...fetchOpts });

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
    <div className="relative w-full">
      <div className="mx-auto max-w-7xl px-0 py-0">
        {/* Header avec progression */}
        <div className="mb-8">
          <div className="flex items-center justify-end mb-6">

            <button
              onClick={saveCV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 hover:text-white transition-all duration-200 shadow-sm"
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
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10" />
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
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-110 border border-white/20"
                          : isCompleted
                            ? "bg-emerald-500 border border-white/20"
                            : "bg-slate-900 border-2 border-white/10 hover:border-indigo-400"
                      }
                    `}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <Icon
                          className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400"}`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium transition-colors duration-200 ${
                        isActive
                          ? "text-indigo-400"
                          : isCompleted
                            ? "text-emerald-400"
                            : "text-slate-500"
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
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600/50 to-purple-600/50 backdrop-blur-md px-6 py-4 border-b border-white/10">
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
                      <UserCircle className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                      <input
                        className="w-full rounded-xl bg-slate-950/50 border border-white/10 pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                        placeholder="Nom complet"
                        value={cv.fullName}
                        onChange={(e) =>
                          setCv({ ...cv, fullName: e.target.value })
                        }
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                      <input
                        className="w-full rounded-xl bg-slate-950/50 border border-white/10 pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                        placeholder="Email (obligatoire)"
                        type="email"
                        value={cv.email}
                        onChange={(e) =>
                          setCv({ ...cv, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                      <input
                        className="w-full rounded-xl bg-slate-950/50 border border-white/10 pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                        placeholder="Numéro de téléphone (ex: +237 6XX XXX XXX)"
                        type="tel"
                        value={cv.phone || ""}
                        onChange={(e) =>
                          setCv({ ...cv, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                      <input
                        className="w-full rounded-xl bg-slate-950/50 border border-white/10 pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
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
                    className="w-full rounded-xl bg-slate-950/50 border border-white/10 p-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
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
                          className="relative rounded-xl bg-slate-900/50 border border-white/10 p-4 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:bg-slate-900/80 transition-all duration-200 group"
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
                              className="w-full rounded-lg bg-slate-950/50 border border-white/10 p-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
                              className="w-full rounded-lg bg-slate-950/50 border border-white/10 p-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
                                className="w-full rounded-lg bg-slate-950/50 border border-white/10 p-2 text-sm text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
                                className="w-full rounded-lg bg-slate-950/50 border border-white/10 p-2 text-sm text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
                              className="w-full rounded-lg bg-slate-950/50 border border-white/10 p-2 text-sm text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
                          className="relative rounded-xl bg-slate-900/50 border border-white/10 p-4 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:bg-slate-900/80 transition-all duration-200 group"
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
                                className="w-full rounded-lg bg-slate-950/50 border border-white/10 p-2 text-sm text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
                                className="w-full rounded-lg bg-slate-950/50 border border-white/10 p-2 text-sm text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
                      <label className="text-sm font-medium text-slate-300">
                        Modèle de CV
                      </label>
                      <select
                        className="w-full rounded-xl bg-slate-950/50 border border-white/10 p-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
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
                      <label className="text-sm font-medium text-slate-300">
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
                          <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 cursor-pointer hover:bg-white/5 transition-colors text-slate-300">
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

                    <p className="text-sm text-slate-500 text-center">
                      L&apos;aperçu à droite se met à jour selon le modèle choisi.
                    </p>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="space-y-6">
                    {paymentDone ? (
                      <div className="rounded-2xl bg-slate-900/50 border border-emerald-500/30 p-6 text-center space-y-4 shadow-lg shadow-emerald-500/10">
                        <Check className="w-10 h-10 text-green-600 mx-auto" />
                        <p className="font-bold text-emerald-400">Paiement confirmé</p>
                        <p className="text-sm text-slate-400">
                          Téléchargez votre CV en PDF (format A4).
                        </p>
                        <button
                          type="button"
                          onClick={downloadPdf}
                          disabled={isDownloading}
                          className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-white font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          {isDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          Télécharger le PDF
                        </button>
                        {cvId && (
                          <Link
                            href={`/preview?cvId=${cvId}`}
                            className="text-sm text-blue-600 hover:underline block"
                          >
                            Aperçu plein écran
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-slate-900/50 border border-indigo-500/30 p-6 text-center space-y-4 shadow-lg shadow-indigo-500/10">
                        <CreditCard className="w-12 h-12 text-blue-600 mx-auto" />
                        <p className="font-bold text-white">
                          Paiement Mobile Money — {paymentAmount} {paymentCurrency}
                        </p>
                        <p className="text-sm text-slate-400">
                          MTN ou Orange Money. Le PDF sera disponible après
                          confirmation sur votre téléphone.
                        </p>
                        <button
                          type="button"
                          onClick={async () => {
                            await saveCV();
                            if (!cvId) {
                              const id = await finalizeCV();
                              if (!id) return;
                            } else if (!isReady) {
                              await finalizeCV();
                            }
                            setShowPaymentModal(true);
                          }}
                          disabled={isSaving}
                          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-white font-semibold disabled:opacity-60"
                        >
                          {isSaving ? "Enregistrement…" : "Payer maintenant"}
                        </button>
                      </div>
                    )}
                    {!isLoggedIn && (
                      <SaveAccountCta
                        cvId={cvId}
                        defaultEmail={cv.email}
                        defaultFullName={cv.fullName}
                        onAuthSuccess={() => setIsLoggedIn(true)}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="border-t border-white/10 px-6 py-4 bg-slate-950/50 flex justify-between">
                <button
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-6 py-2 text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-200 disabled:opacity-50"
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
                    disabled={!canGoNext || isSaving}
                    onClick={async () => {
                      if (currentStep === 5) {
                        await finalizeCV();
                        return;
                      }
                      setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
                    }}
                    type="button"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Suivant
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : paymentDone ? (
                  <button
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-2 text-white font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                    onClick={downloadPdf}
                    disabled={isDownloading}
                    type="button"
                  >
                    {isDownloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Télécharger
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-white font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                    onClick={async () => {
                      if (!cvId) await finalizeCV();
                      else setShowPaymentModal(true);
                    }}
                    disabled={isSaving}
                    type="button"
                  >
                    <CreditCard className="w-4 h-4" />
                    Payer
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-3 border-b border-white/10">
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
        defaultPhone={cv.phone || ""}
        onSuccess={() => {
          setPaymentDone(true);
          setShowPaymentModal(false);
        }}
        paymentAmount={paymentAmount}
        paymentCurrency={paymentCurrency}
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
          background: transparent;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
}
