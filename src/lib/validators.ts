import { z } from "zod";

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase(),
  password: z.string().min(6, "Mot de passe minimum 6 caractères"),
});

export const registerSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase(),
  password: z.string().min(8, "Mot de passe minimum 8 caractères"),
  fullName: z.string().min(2, "Nom complet minimum 2 caractères"),
});

// Phone validation for Cameroon mobile money
const cameroonPhoneRegex = /^(\+237|237)?[2689]\d{7,8}$/;
export const phoneSchema = z.string()
  .regex(cameroonPhoneRegex, "Numéro Camerounais invalide (+237 ou local)");

// CV schemas
const cvTemplateSchema = z
  .enum([
    "modern",
    "classic",
    "premium",
    "minimal",
    "modern-timeline",
    "classic-columns",
  ])
  .default("modern");
const cvStatusSchema = z.enum(["draft", "ready", "published"]).default("draft");

export const cvPayloadSchema = z.object({
  fullName: z.string().min(1, "Nom complet requis").trim(),
  email: z.string().email("Email invalide").toLowerCase(),
  phone: z.string().optional().default(""),
  title: z.string().min(1, "Titre requis").trim(),
  summary: z.string().default(""),
  experiences: z
    .array(
      z.object({
        company: z.string().default(""),
        role: z.string().default(""),
        startDate: z.string().default(""),
        endDate: z.string().default(""),
        summary: z.string().default(""),
      })
    )
    .default([]),
  education: z
    .array(
      z.object({
        school: z.string().default(""),
        degree: z.string().default(""),
        startDate: z.string().default(""),
        endDate: z.string().default(""),
      })
    )
    .default([]),
  skills: z.array(z.string()).default([]),
  photoUrl: z.string().optional().default(""),
  template: cvTemplateSchema,
  status: cvStatusSchema,
});

// Payment schemas
export const paymentInitiateSchema = z.object({
  cvId: z.string().min(1, "CV ID requis"),
  paymentPhone: phoneSchema,
  customer: z.string().email("Email client invalide").toLowerCase().optional(),
});

