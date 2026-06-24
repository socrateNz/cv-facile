import { CVBuilder } from "@/components/cv-builder";
import { CVDocument } from "@/types/cv";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";

type CVPageProps = {
  searchParams: Promise<{
    template?: CVDocument["template"];
    cvId?: string;
    step?: string;
    export?: string;
    pay?: string;
  }>;
};

export default async function CVPage({ searchParams }: CVPageProps) {
  const params = await searchParams;
  const template = params.template;
  const cvId = params.cvId || "";
  const initialStep = params.step ? Number(params.step) : 0;
  const openPaymentOnLoad = params.pay === "1" || params.export === "1";
  const settings = await getSiteSettings();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 font-sans antialiased overflow-hidden selection:bg-indigo-500/30 flex flex-col relative pb-10">
      {/* ── BACKGROUND ANIMATIONS ── */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[120px] opacity-70 animate-blob"></div>
        <div className="absolute top-1/2 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full mix-blend-screen filter blur-[120px] opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-8 pb-6 flex flex-col sm:flex-row gap-6 sm:items-center">
        <Link
          href={"/"}
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 group shrink-0"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        </Link>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-medium text-indigo-200">Création en cours</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Éditeur de CV</h1>
          <p className="text-slate-400 mt-1">
            Complétez vos informations à gauche, le PDF se met à jour en temps réel à droite.
          </p>
        </div>
      </div>
      
      <div className="relative z-10 w-full flex-1">
        <CVBuilder
          initialTemplate={template}
          existingCvId={cvId}
          initialStep={Number.isFinite(initialStep) ? initialStep : 0}
          openPaymentOnLoad={openPaymentOnLoad}
          paymentAmount={settings?.payment.paymentAmount || 500}
          paymentCurrency={settings?.payment.currency || "XAF"}
        />
      </div>
    </main>
  );
}
