import { CVBuilder } from "@/components/cv-builder";
import { CVDocument } from "@/types/cv";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
  const openExportOnLoad = params.export === "1" || params.pay === "1";

  return (
    <main className="min-h-screen bg-gray-ui">
      <div className="flex flex-row gap-4 mx-auto max-w-7xl px-4 pt-8">
        <Link
          href={"/"}
          className="flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200 group w-fit h-fit p-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Créer mon CV</h1>
          <p className="text-gray-600">
            Remplissez le formulaire, voyez l’aperçu en direct et exportez votre
            CV.
          </p>
        </div>
      </div>
      <CVBuilder
        initialTemplate={template}
        existingCvId={cvId}
        initialStep={Number.isFinite(initialStep) ? initialStep : 0}
        openExportOnLoad={openExportOnLoad}
      />
    </main>
  );
}
