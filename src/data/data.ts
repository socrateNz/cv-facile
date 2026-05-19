import { ClassicTemplate } from "@/components/templates/classic-template";
import { ModernTemplate } from "@/components/templates/modern-template";
import { PremiumTemplate } from "@/components/templates/premium-template";
import { MinimalTemplate } from "@/components/templates/minimal-template";
import { ModernTimelineTemplate } from "@/components/templates/modern-timeline";
import { ClassicColumnsTemplate } from "@/components/templates/classic-columns";
import type { CVDocument, CVTemplate } from "@/types/cv";

const basePreview: Omit<CVDocument, "template" | "fullName" | "title" | "email"> = {
  userId: "",
  phone: "+237 6 12 34 56 78",
  summary:
    "Professionnel motivé avec une solide expérience et des compétences adaptées au poste visé.",
  skills: ["React", "TypeScript", "Gestion de projet", "Communication", "Leadership"],
  experiences: [
    {
      role: "Poste principal",
      company: "Entreprise ABC",
      startDate: "2022",
      endDate: "Présent",
      summary: "Réalisations clés et responsabilités principales.",
    },
    {
      role: "Poste précédent",
      company: "Société XYZ",
      startDate: "2020",
      endDate: "2021",
      summary: "Contributions mesurables à la performance de l'équipe.",
    },
  ],
  education: [
    {
      degree: "Diplôme",
      school: "Université",
      startDate: "2018",
      endDate: "2020",
    },
  ],
  status: "draft",
};

function previewFor(
  template: CVTemplate,
  overrides: Partial<CVDocument> = {},
): CVDocument {
  return {
    ...basePreview,
    fullName: "Jean Dupont",
    title: "Titre professionnel",
    email: "jean.dupont@email.com",
    template,
    ...overrides,
  };
}

export const previewDataMap: Record<CVTemplate, CVDocument> = {
  modern: previewFor("modern", {
    fullName: "Jean Dupont",
    title: "Développeur Full Stack",
    summary:
      "Développeur passionné avec 5 ans d'expérience. Expert React, Next.js et TypeScript.",
  }),
  classic: previewFor("classic", {
    fullName: "Marie Martin",
    title: "Chef de Projet",
    email: "marie.martin@email.com",
    summary: "Chef de projet expérimentée, gestion d'équipes et livraison Agile.",
    skills: ["Gestion de projet", "Agile/Scrum", "Jira", "Leadership"],
  }),
  premium: previewFor("premium", {
    fullName: "Sophie Bernard",
    title: "Designer UX/UI",
    email: "sophie.bernard@email.com",
    summary: "Designer créative spécialisée UX/UI, 6 ans d'expérience.",
    skills: ["Figma", "Adobe XD", "UX Research", "Prototypage"],
  }),
  minimal: previewFor("minimal", {
    fullName: "Paul Nkodo",
    title: "Analyste financier",
    email: "paul.nkodo@email.com",
    summary: "Profil épuré, orienté résultats et clarté.",
    skills: ["Excel", "Analyse", "Reporting", "Budget"],
  }),
  "modern-timeline": previewFor("modern-timeline", {
    fullName: "Amina Bello",
    title: "Marketing Digital",
    email: "amina.bello@email.com",
    summary: "Spécialiste growth et campagnes multicanales.",
    skills: ["SEO", "Social Ads", "Analytics", "Content"],
  }),
  "classic-columns": previewFor("classic-columns", {
    fullName: "David Fotsing",
    title: "Ingénieur logiciel",
    email: "david.fotsing@email.com",
    summary: "Ingénieur full stack, architecture et delivery.",
    skills: ["Node.js", "PostgreSQL", "Docker", "CI/CD"],
  }),
};

export const templates = [
  {
    id: "modern" as const,
    title: "Modern",
    desc: "Design clair et contemporain",
    badge: "🔥 Tendance",
    component: ModernTemplate,
  },
  {
    id: "classic" as const,
    title: "Classic",
    desc: "Présentation sobre et formelle",
    badge: "📄 Classique",
    component: ClassicTemplate,
  },
  {
    id: "premium" as const,
    title: "Premium",
    desc: "Style créatif avec mise en page avancée",
    badge: "⭐ Populaire",
    component: PremiumTemplate,
  },
  {
    id: "minimal" as const,
    title: "Minimal",
    desc: "Épuré, lisible et professionnel",
    badge: "✨ Épuré",
    component: MinimalTemplate,
  },
  {
    id: "modern-timeline" as const,
    title: "Modern Timeline",
    desc: "Chronologie visuelle et sections structurées",
    badge: "📅 Timeline",
    component: ModernTimelineTemplate,
  },
  {
    id: "classic-columns" as const,
    title: "Classic Columns",
    desc: "Mise en page deux colonnes classique",
    badge: "📊 Colonnes",
    component: ClassicColumnsTemplate,
  },
];

export const TEMPLATE_IDS = templates.map((t) => t.id);
