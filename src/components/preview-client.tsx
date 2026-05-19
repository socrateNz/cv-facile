"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    loadCV();
  }, [cvId]);

  async function loadCV() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(cvId ? `/api/cv/${cvId}` : "/api/cv");
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.message || "Impossible de charger le CV");
        return;
      }

      if (cvId && payload?.data) {
        setCv(payload.data);
      } else if (!cvId && payload?.data?.length) {
        setCv(payload.data[0]);
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
    if (!cvId) return;
    setIsGeneratingPDF(true);
    try {
      window.open(`/api/cv/${cvId}/pdf`, '_blank');
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
              href="/my-cvs"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
            >
              Mes CV
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
                  href={`/cv?cvId=${cvId}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </Link>

                {cv.isPaid ? (
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
                ) : (
                  <Link
                    href={`/cv?cvId=${cvId}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium hover:shadow-lg transition-all duration-200"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Payer
                  </Link>
                )}

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

        {/* Status Banner pour non payé */}
        {!cv.isPaid && !isFullscreen && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-800">Version de démonstration</p>
                <p className="text-sm text-amber-700 mt-1">
                  Ce CV n'a pas encore été payé. Le téléchargement PDF sera disponible après paiement.
                </p>
                <Link
                  href={`/cv?cvId=${cvId}`}
                  className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-amber-800 hover:text-amber-900 transition-colors"
                >
                  Procéder au paiement →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Status Banner pour expiré */}
        {cv.isExpired && !isFullscreen && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-800">Lien expiré</p>
                <p className="text-sm text-red-700 mt-1">
                  Votre période de téléchargement a expiré. Vous devez effectuer un nouveau paiement.
                </p>
                <Link
                  href={`/cv?cvId=${cvId}`}
                  className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-red-800 hover:text-red-900 transition-colors"
                >
                  Renouveler l'accès →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Info pour téléchargeable */}
        {cv.isPaid && !cv.isExpired && !isFullscreen && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="font-semibold text-green-800">Version complète disponible</p>
                <p className="text-sm text-green-700">
                  Vous pouvez télécharger ce CV en PDF.
                </p>
              </div>
              {cv.expiresAt && (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Clock className="w-4 h-4" />
                  <span>Valable jusqu'au {new Date(cv.expiresAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              )}
            </div>
          </div>
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