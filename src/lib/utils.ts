import { TEMPLATE_IDS } from "@/data/data";
import { CVDocument } from "@/types/cv";

export function normalizeTemplate(template: string): CVDocument["template"] {
  // Vérifier si le template est valide
  if (TEMPLATE_IDS.includes(template as any)) {
    return template as CVDocument["template"];
  }
  
  // Valeur par défaut
  return "modern";
}