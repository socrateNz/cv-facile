import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CVModel } from "@/models/CV";
import { cvPayloadSchema } from "@/lib/validators";
import { getSessionUser } from "@/lib/auth";
import {
  buildCvAccessFilter,
  getGuestId,
  getOrCreateGuestId,
  setGuestCookie,
} from "@/lib/guest";
import { auditEvent } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectToDatabase();
  const session = getSessionUser(req);
  const guestId = getGuestId(req);
  const { id } = await params;

  const filter = buildCvAccessFilter(id, session, guestId);
  if (!filter) {
    return NextResponse.json({ message: "Accès refusé." }, { status: 403 });
  }

  const cv = await CVModel.findOne(filter).lean();
  if (!cv) {
    return NextResponse.json({ message: "CV introuvable." }, { status: 404 });
  }

  return NextResponse.json({ data: cv });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectToDatabase();
  const session = getSessionUser(req);
  const guestId = getGuestId(req);
  const { id } = await params;
  const body = await req.json();

  const validation = cvPayloadSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { message: "Données invalides", errors: validation.error.flatten() },
      { status: 400 },
    );
  }

  const filter = buildCvAccessFilter(id, session, guestId);
  if (!filter) {
    return NextResponse.json({ message: "Accès refusé." }, { status: 403 });
  }

  const updated = await CVModel.findOneAndUpdate(filter, validation.data, {
    new: true,
  }).lean<{ guestId?: string | null } | null>();

  if (!updated) {
    return NextResponse.json(
      { message: "Mise à jour impossible." },
      { status: 404 },
    );
  }

  const response = NextResponse.json({ data: updated });

  if (!session && updated.guestId) {
    setGuestCookie(response, String(updated.guestId));
  } else if (!session) {
    const newGuestId = getOrCreateGuestId(req);
    await CVModel.findByIdAndUpdate(id, { guestId: newGuestId });
    setGuestCookie(response, newGuestId);
  }

  auditEvent({
    action: "cv.update",
    userId: session?.userId || `guest:${guestId?.slice(0, 8) || "anon"}`,
    resource: `cv:${id}`,
    status: "success",
  });

  return response;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectToDatabase();
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { message: "Connectez-vous pour supprimer un CV." },
      { status: 401 },
    );
  }

  const guestId = getGuestId(req);
  const { id } = await params;
  const filter = buildCvAccessFilter(id, session, guestId);
  if (!filter) {
    return NextResponse.json({ message: "Accès refusé." }, { status: 403 });
  }

  const deleted = await CVModel.findOneAndUpdate(
    filter,
    { deletedAt: new Date() },
    { new: true },
  ).lean();

  if (!deleted) {
    return NextResponse.json(
      { message: "Suppression impossible." },
      { status: 404 },
    );
  }

  auditEvent({
    action: "cv.delete",
    userId: session.userId,
    resource: `cv:${id}`,
    status: "success",
  });

  return NextResponse.json({ ok: true });
}
