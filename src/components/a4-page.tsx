import {
  A4_HEIGHT_MM,
  A4_PAGE_PADDING_CSS,
  A4_WIDTH_MM,
} from "@/lib/a4";

type A4PageProps = {
  children: React.ReactNode;
  className?: string;
  /** Pour mesure / scale dans l'aperçu */
  innerRef?: React.Ref<HTMLDivElement>;
};

/**
 * Feuille A4 exacte (210 × 297 mm) avec marges PDF.
 * Le contenu à l'intérieur correspond à la zone imprimable du PDF.
 */
export function A4Page({ children, className = "", innerRef }: A4PageProps) {
  return (
    <div
      ref={innerRef}
      className={`bg-white box-border overflow-hidden ${className}`}
      style={{
        width: `${A4_WIDTH_MM}mm`,
        height: `${A4_HEIGHT_MM}mm`,
        minHeight: `${A4_HEIGHT_MM}mm`,
        padding: A4_PAGE_PADDING_CSS,
        overflow: "hidden",
      }}
    >
      <div className="w-full h-full min-h-0 [&>div]:!mx-0 [&>div]:!max-w-none [&>div]:!w-full">
        {children}
      </div>
    </div>
  );
}
