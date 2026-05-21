"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SaveAccountCta } from "@/components/save-account-cta";
import { LOCAL_CV_KEY } from "@/lib/guest-constants";
import { CVPreview } from "@/components/cv-preview";
import { defaultCV } from "@/lib/defaults";
import {
  ArrowLeft,
  Download,
  Edit,
  Printer,
  Share2,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Maximize2,
  Minimize2
} from "lucide-react";

export function PreviewClient({ cvId }: { cvId: string }) {
  const router = useRouter();
  const [cv, setCv] = useState(defaultCV);
  const [resolvedCvId, setResolvedCvId] = useState(cvId);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => setIsLoggedIn(r.ok));
  }, []);

  useEffect(() => {
    loadCV();
  }, [cvId]);

  async function loadCV() {
    setIsLoading(true);
    setError(null);
    const id =
      cvId ||
      (typeof window !== "undefined" ? localStorage.getItem(LOCAL_CV_KEY) : "") ||
      "";

    if (!id) {
      setError("Aucun CV à afficher. Commencez par créer votre CV.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/cv/${id}`, { credentials: "include" });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.message || "Impossible de charger le CV");
        return;
      }

      if (payload?.data) {
        setCv(payload.data);
        setResolvedCvId(id);
      } else {
        setError("Aucun CV trouvé");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDownloadPDF() {
    const id = resolvedCvId || cvId;
    if (!id) return;
    setIsGeneratingPDF(true);
    try {
      window.open(`/api/cv/${id}/pdf`, "_blank");
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CV de ${cv.fullName || "Mon CV"}`,
          text: `Découvrez mon CV professionnel`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Partage annulé");
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Lien copié dans le presse-papier !");
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <FileText className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 font-medium">Chargement de votre CV...</p>
          <p className="text-sm text-gray-400 mt-1">Préparation de l'aperçu</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Retour
            </button>
            <Link
              href="/cv"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
            >
              Créer un CV
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 ${isFullscreen ? 'p-0' : 'px-4 py-8'}`}>
      <div className={`mx-auto ${isFullscreen ? 'max-w-full' : 'max-w-5xl'} space-y-4`}>

        {/* Header avec actions */}
        {!isFullscreen && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sticky top-4 z-10 backdrop-blur-sm bg-white/95">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Aperçu du CV
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {cv.fullName || "CV sans nom"} • {cv.title || "Titre non défini"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/cv?cvId=${resolvedCvId || cvId}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </Link>

                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-60"
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Télécharger PDF
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  {isFullscreen ? "Réduire" : "Plein écran"}
                </button>
              </div>
            </div>
          </div>
        )}

        {!isLoggedIn && !isFullscreen && (
          <SaveAccountCta
            cvId={resolvedCvId || cvId}
            defaultEmail={cv.email}
            defaultFullName={cv.fullName}
            onAuthSuccess={() => setIsLoggedIn(true)}
          />
        )}

        {/* Aperçu du CV */}
        <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 ${isFullscreen ? 'rounded-none' : ''
          }`}>
          <div className={`${!isFullscreen ? 'max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb:hover]:bg-gray-400' : ''}`}>
            <CVPreview cv={cv} />
          </div>
        </div>

        {/* Footer */}
        {!isFullscreen && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-500">
              <Eye className="w-3 h-3 inline mr-1" />
              Aperçu en temps réel • Les modifications sont automatiquement sauvegardées
            </p>
          </div>
        )}
      </div>

      <style>
        {`
          @media print {
            button, a, .sticky {
              display: none !important;
            }
          }
        `}
      </style>
    </main>
  );
}