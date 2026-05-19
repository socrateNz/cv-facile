import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { assertRole, getSessionUser } from "@/lib/auth";

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
  await UserModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
