"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { A4Page } from "@/components/a4-page";
import { CVPreview } from "@/components/cv-preview";
import { defaultCV } from "@/lib/defaults";
import type { CVDocument } from "@/types/cv";

function CVPrintContent() {
  const searchParams = useSearchParams();
  const cvId = searchParams.get("cvId") || "";
  const [cv, setCv] = useState<CVDocument | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!cvId) {
      setCv(defaultCV);
      setReady(true);
      return;
    }

    fetch(`/api/cv/${cvId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        setCv(payload?.data || defaultCV);
        setReady(true);
      })
      .catch(() => {
        setCv(defaultCV);
        setReady(true);
      });
  }, [cvId]);

  if (!ready || !cv) {
    return (
      <div
        data-pdf-ready="false"
        className="min-h-screen bg-white flex items-center justify-center"
      >
        <p className="text-gray-400 text-sm">Préparation du PDF…</p>
      </div>
    );
  }

  return (
    <div data-pdf-ready="true" className="min-h-screen bg-white">
      <style jsx global>{`
        @page {
          size: A4;
          margin: 0;
        }
        html,
        body {
          margin: 0;
          padding: 0;
          background: white !important;
        }
      `}</style>
      <A4Page>
        <CVPreview cv={cv} />
      </A4Page>
    </div>
  );
}

export default function CVPrintPage() {
  return (
    <Suspense fallback={<div data-pdf-ready="false" className="min-h-screen bg-white" />}>
      <CVPrintContent />
    </Suspense>
  );
}
