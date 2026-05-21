import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CVModel } from "@/models/CV";
import { PaymentModel } from "@/models/Payment";
import { cvPayloadSchema } from "@/lib/validators";
import { getSessionUser } from "@/lib/auth";
import {
  getGuestId,
  getOrCreateGuestId,
  setGuestCookie,
} from "@/lib/guest";
import { auditEvent } from "@/lib/audit";

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { message: "Connectez-vous pour voir vos CV sauvegardés." },
      { status: 401 },
    );
  }

  const { userId } = session;
  const cvs = await CVModel.find({ userId, deletedAt: null })
    .sort({ updatedAt: -1 })
    .lean();

  const cvIds = cvs.map((cv) => cv._id);
  const payments = await PaymentModel.find({
    cvId: { $in: cvIds },
    status: "completed",
    deletedAt: null,
  })
    .sort({ completedAt: -1 })
    .lean();

  const paymentByCv: Record<string, (typeof payments)[0]> = {};
  payments.forEach((p) => {
    const cid = String(p.cvId);
    if (!paymentByCv[cid]) {
      paymentByCv[cid] = p;
    }
  });

  const data = cvs.map((cv) => {
    const payment = paymentByCv[String(cv._id)];
    let isExpired = false;
    let isPaid = !!payment;

    if (payment?.expiresAt && new Date() > new Date(payment.expiresAt)) {
      isExpired = true;
      isPaid = false;
    }

    return {
      ...cv,
      isPaid,
      isExpired,
      expiresAt: payment?.expiresAt || null,
    };
  });

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const session = getSessionUser(req);
  const body = await req.json();

  const validation = cvPayloadSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { message: "Données invalides", errors: validation.error.flatten() },
      { status: 400 },
    );
  }

  const guestId = session ? getGuestId(req) || getOrCreateGuestId(req) : getOrCreateGuestId(req);

  const cv = await CVModel.create({
    userId: session?.userId ?? null,
    guestId: session ? guestId : guestId,
    ...validation.data,
  });

  const response = NextResponse.json({ data: cv }, { status: 201 });

  if (!session) {
    setGuestCookie(response, guestId);
  }

  auditEvent({
    action: "cv.create",
    userId: session?.userId || `guest:${guestId.slice(0, 8)}`,
    resource: `cv:${cv._id}`,
    status: "success",
    meta: { anonymous: !session },
  });

  return response;
}
