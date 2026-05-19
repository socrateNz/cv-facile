import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { PaymentModel } from "@/models/Payment";
import { assertRole, getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const session = getSessionUser(req);
  if (!session || !assertRole(session.role, "admin")) {
    return NextResponse.json({ message: "Accès admin requis." }, { status: 403 });
  }
  const payments = await PaymentModel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ data: payments });
}
