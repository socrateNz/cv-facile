import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { CVModel } from "@/models/CV";
import { PaymentModel } from "@/models/Payment";
import { assertRole, getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const session = getSessionUser(req);
  if (!session || !assertRole(session.role, "admin")) {
    return NextResponse.json({ message: "Accès admin requis." }, { status: 403 });
  }

  const [usersCount, cvsCount, completedPaymentsCount] = await Promise.all([
    UserModel.countDocuments(),
    CVModel.countDocuments(),
    PaymentModel.countDocuments({ status: "completed" }),
  ]);

  return NextResponse.json({
    data: {
      usersCount,
      cvsCount,
      revenue: completedPaymentsCount * 100,
    },
  });
}
