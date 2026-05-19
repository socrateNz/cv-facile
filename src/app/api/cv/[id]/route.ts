import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CVModel } from "@/models/CV";
import { cvPayloadSchema } from "@/lib/validators";
import { getSessionUser } from "@/lib/auth";
import { auditEvent } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { message: "Authentification requise." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const { userId, role } = session;
  const query = role === "admin" ? { _id: id } : { _id: id, userId };

  const cv = await CVModel.findOne(query).lean();
  if (!cv) {
    return NextResponse.json(
      { message: "CV introuvable." },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: cv });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { message: "Authentification requise." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const { userId, role } = session;
  const body = await req.json();

  const validation = cvPayloadSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { message: "Données invalides", errors: validation.error.flatten() },
      { status: 400 }
    );
  }

  const query = role === "admin" ? { _id: id } : { _id: id, userId };
  const updated = await CVModel.findOneAndUpdate(query, validation.data, {
    new: true,
  }).lean();

  if (!updated) {
    return NextResponse.json(
      { message: "Mise à jour impossible." },
      { status: 404 }
    );
  }

  auditEvent({
    action: "cv.update",
    userId,
    resource: `cv:${id}`,
    status: "success",
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { message: "Authentification requise." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const { userId, role } = session;
  const query = role === "admin" ? { _id: id } : { _id: id, userId };

  // Soft delete: set deletedAt instead of removing
  const deleted = await CVModel.findOneAndUpdate(
    query,
    { deletedAt: new Date() },
    { new: true }
  ).lean();

  if (!deleted) {
    return NextResponse.json(
      { message: "Suppression impossible." },
      { status: 404 }
    );
  }

  auditEvent({
    action: "cv.delete",
    userId,
    resource: `cv:${id}`,
    status: "success",
  });

  return NextResponse.json({ ok: true });
}
