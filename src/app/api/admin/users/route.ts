import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { assertRole, getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const session = getSessionUser(req);
  if (!session || !assertRole(session.role, "admin")) {
    return NextResponse.json({ message: "Accès admin requis." }, { status: 403 });
  }
  const users = await UserModel.find().select("-passwordHash").sort({ createdAt: -1 }).lean();
  const mappedUsers = users.map((u: any) => ({
    ...u,
    emailOrPhone: u.email || u.phone || ""
  }));
  return NextResponse.json({ data: mappedUsers });
}
