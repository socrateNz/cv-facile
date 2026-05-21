import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import type { SessionUser } from "@/lib/auth";
import { GUEST_COOKIE } from "@/lib/guest-constants";
import { CVModel } from "@/models/CV";

export { GUEST_COOKIE, LOCAL_CV_KEY } from "@/lib/guest-constants";

const GUEST_MAX_AGE = 60 * 60 * 24 * 365;

export function getGuestId(req: NextRequest): string | null {
  const value = req.cookies.get(GUEST_COOKIE)?.value?.trim();
  return value || null;
}

export function getOrCreateGuestId(req: NextRequest): string {
  return getGuestId(req) || randomUUID();
}

export function setGuestCookie(res: NextResponse, guestId: string) {
  res.cookies.set(GUEST_COOKIE, guestId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: GUEST_MAX_AGE,
  });
}

/** Filtre MongoDB : accès au CV par propriétaire connecté ou invité */
export function buildCvAccessFilter(
  cvId: string,
  session: SessionUser | null,
  guestId: string | null,
): Record<string, unknown> | null {
  if (session?.role === "admin") {
    return { _id: cvId, deletedAt: null };
  }

  const clauses: Record<string, unknown>[] = [];
  if (session?.userId) {
    clauses.push({ _id: cvId, userId: session.userId, deletedAt: null });
  }
  if (guestId) {
    clauses.push({ _id: cvId, guestId, deletedAt: null });
  }

  if (clauses.length === 0) return null;
  if (clauses.length === 1) return clauses[0];
  return { $or: clauses };
}

/** Associe les CV invités au compte après connexion / inscription */
export async function claimGuestCvs(
  guestId: string | null,
  userId: string,
): Promise<number> {
  if (!guestId) return 0;

  const result = await CVModel.updateMany(
    { guestId, deletedAt: null, $or: [{ userId: null }, { userId: { $exists: false } }] },
    { $set: { userId }, $unset: { guestId: "" } },
  );

  return result.modifiedCount;
}
