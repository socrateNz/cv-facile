import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { UserModel } from "@/models/User";

type MeUser = {
  _id: string;
  email: string;
  fullName: string;
  role: "user" | "admin";
};

export async function GET(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ message: "Non authentifié." }, { status: 401 });
  }

  await connectToDatabase();
  const user = await UserModel.findById(session.userId).lean<MeUser | null>();
  if (!user) {
    return NextResponse.json({ message: "Utilisateur introuvable." }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      id: String(user._id),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  });
}
