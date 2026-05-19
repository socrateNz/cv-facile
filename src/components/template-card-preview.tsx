"use client";

import type { CVDocument } from "@/types/cv";
import { ScaledCVPreview } from "@/components/scaled-cv-preview";

type TemplateCardPreviewProps = {
  cv: CVDocument;
  TemplateComponent: React.ComponentType<{ cv: CVDocument }>;
};

export function TemplateCardPreview({
  cv,
  TemplateComponent,
}: TemplateCardPreviewProps) {
  return (
    <ScaledCVPreview
      cv={cv}
      variant="card"
      TemplateComponent={TemplateComponent}
    />
  );
}
