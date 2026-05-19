"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { A4Page } from "@/components/a4-page";
import { CVPreview } from "@/components/cv-preview";
import { A4_HEIGHT_PX, A4_WIDTH_PX } from "@/lib/a4";
import type { CVDocument } from "@/types/cv";

type ScaledCVPreviewProps = {
  cv: CVDocument;
  variant?: "card" | "panel";
  className?: string;
  TemplateComponent?: React.ComponentType<{ cv: CVDocument }>;
};

export function ScaledCVPreview({
  cv,
  variant = "card",
  className = "",
  TemplateComponent,
}: ScaledCVPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const a4Ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [pageSize, setPageSize] = useState({
    width: A4_WIDTH_PX,
    height: A4_HEIGHT_PX,
  });

  const PreviewBody = TemplateComponent ?? CVPreview;

  const updateScale = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const padding = variant === "panel" ? 24 : 8;
    const availW = container.clientWidth - padding;
    const availH = container.clientHeight - padding;
    if (availW <= 0 || availH <= 0) return;

    const pageW = a4Ref.current?.offsetWidth || A4_WIDTH_PX;
    const pageH = a4Ref.current?.offsetHeight || A4_HEIGHT_PX;
    setPageSize({ width: pageW, height: pageH });

    const widthScale = availW / pageW;
    const heightScale = availH / pageH;
    setScale(
      variant === "panel"
        ? Math.min(widthScale, heightScale) * 0.98
        : Math.min(widthScale, heightScale, 1) * 0.96,
    );
  }, [variant]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateScale();

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateScale);
    });
    resizeObserver.observe(container);

    const mutationObserver = new MutationObserver(() => {
      requestAnimationFrame(updateScale);
    });
    const observeTarget = a4Ref.current;
    if (observeTarget) {
      mutationObserver.observe(observeTarget, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
    }

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [cv, updateScale]);

  const a4Sheet = (
    <A4Page innerRef={a4Ref}>
      <PreviewBody cv={cv} />
    </A4Page>
  );

  if (variant === "card") {
    return (
      <div
        ref={containerRef}
        className={`relative w-full h-[280px] sm:h-[300px] md:h-[320px] overflow-hidden rounded-lg bg-slate-100 ${className}`}
      >
        <div
          className="absolute left-1/2 top-0"
          style={{
            transform: `translateX(-50%) scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          {a4Sheet}
        </div>
      </div>
    );
  }

  const scaledW = pageSize.width * scale;
  const scaledH = pageSize.height * scale;

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-h-[min(560px,60vh)] h-[min(820px,calc(100vh-10rem))] overflow-auto bg-slate-200/90 ${className}`}
    >
      <div className="flex flex-col items-center py-4 px-2 min-h-full">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-3 shrink-0">
          Format A4 (210 × 297 mm) — identique au PDF
        </p>
        <div
          className="shrink-0 shadow-xl rounded-sm bg-white"
          style={{
            width: scaledW,
            height: scaledH,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: pageSize.width,
              height: pageSize.height,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            {a4Sheet}
          </div>
        </div>
      </div>
    </div>
  );
}
