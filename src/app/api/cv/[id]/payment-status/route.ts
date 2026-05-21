import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { getGuestId } from "@/lib/guest";
import { getValidPaymentForCv, userCanAccessCv } from "@/lib/payment-access";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectToDatabase();
  const { id } = await params;
  const session = getSessionUser(req);
  const guestId = getGuestId(req);

  if (!(await userCanAccessCv(id, session, guestId))) {
    return NextResponse.json({ message: "Accès refusé." }, { status: 403 });
  }

  const payment = await getValidPaymentForCv(id);

  return NextResponse.json({
    data: {
      isPaid: !!payment,
      expiresAt: payment?.expiresAt ?? null,
      reference: payment?.reference ?? null,
    },
  });
}
