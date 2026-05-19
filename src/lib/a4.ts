/** Dimensions et marges A4 — alignées sur la génération PDF (Puppeteer) */

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

/** Marges du PDF (voir src/lib/pdf.ts) */
export const PDF_MARGIN_MM = {
  top: 20,
  right: 15,
  bottom: 20,
  left: 15,
} as const;

export const A4_CONTENT_WIDTH_MM =
  A4_WIDTH_MM - PDF_MARGIN_MM.left - PDF_MARGIN_MM.right;

export const A4_CONTENT_HEIGHT_MM =
  A4_HEIGHT_MM - PDF_MARGIN_MM.top - PDF_MARGIN_MM.bottom;

/** Conversion mm → px (96 DPI, standard navigateur) */
export function mmToPx(mm: number): number {
  return Math.round((mm * 96) / 25.4);
}

export const A4_WIDTH_PX = mmToPx(A4_WIDTH_MM);
export const A4_HEIGHT_PX = mmToPx(A4_HEIGHT_MM);

export const A4_PAGE_PADDING_CSS = `${PDF_MARGIN_MM.top}mm ${PDF_MARGIN_MM.right}mm ${PDF_MARGIN_MM.bottom}mm ${PDF_MARGIN_MM.left}mm`;
