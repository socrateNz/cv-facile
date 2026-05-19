"use client";

import type { CVDocument } from "@/types/cv";
import { ModernTemplate } from "@/components/templates/modern-template";
import { ClassicTemplate } from "@/components/templates/classic-template";
import { PremiumTemplate } from "@/components/templates/premium-template";
import { MinimalTemplate } from "@/components/templates/minimal-template";
import { ModernTimelineTemplate } from "@/components/templates/modern-timeline";
import { ClassicColumnsTemplate } from "@/components/templates/classic-columns";

const templateMap: Record<string, React.ComponentType<{ cv: CVDocument }>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  premium: PremiumTemplate,
  minimal: MinimalTemplate,
  "modern-timeline": ModernTimelineTemplate,
  "classic-columns": ClassicColumnsTemplate,
};

type CVPreviewProps = {
  cv: CVDocument;
};

export function CVPreview({ cv }: CVPreviewProps) {
  const TemplateComponent = templateMap[cv.template] || ModernTemplate;
  return <TemplateComponent cv={cv} />;
}