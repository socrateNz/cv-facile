import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CVModel } from "@/models/CV";
import { assertRole, getSessionUser } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  const session = getSessionUser(req);
  if (!session || !assertRole(session.role, "admin")) {
    return NextResponse.json({ message: "Accès admin requis." }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const cv = await CVModel.findByIdAndUpdate(id, { isPublished: !!body.isPublished }, { new: true });
  return NextResponse.json({ data: cv });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectToDatabase();
  const session = getSessionUser(req);
  if (!session || !assertRole(session.role, "admin")) {
    return NextResponse.json({ message: "Accès admin requis." }, { status: 403 });
  }
  const { id } = await params;
  await CVModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}

