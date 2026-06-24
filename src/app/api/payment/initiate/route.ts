import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { buildCvAccessFilter, getGuestId, getOrCreateGuestId, setGuestCookie } from "@/lib/guest";
import { getValidPaymentForCv } from "@/lib/payment-access";
import { CVModel } from "@/models/CV";
import { PaymentModel } from "@/models/Payment";
import { createNotchPayTransaction, detectPaymentMethod } from "@/lib/notchpay";
import { paymentInitiateSchema } from "@/lib/validators";
import { auditEvent } from "@/lib/audit";
import { log, maskReference } from "@/lib/logger";
import { getSiteSettings } from "@/lib/settings";

const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxAttempts: number = 5, windowMs: number = 5 * 60 * 1000): boolean {
  const now = Date.now();
  const record = RATE_LIMIT_MAP.get(key);

  if (!record || now > record.resetAt) {
    RATE_LIMIT_MAP.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const session = getSessionUser(req);
  const guestId = session ? getGuestId(req) || getOrCreateGuestId(req) : getOrCreateGuestId(req);
  const body = await req.json();
  const settings = await getSiteSettings();
  const paymentAmount = settings?.payment.paymentAmount || 500;

  const validation = paymentInitiateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { message: "Données invalides", errors: validation.error.flatten() },
      { status: 400 },
    );
  }

  const { cvId, paymentPhone } = validation.data;
  const customer = validation.data.customer || session?.email || "";

  if (!customer) {
    return NextResponse.json(
      { message: "Indiquez votre email dans le formulaire CV." },
      { status: 400 },
    );
  }

  const rateLimitKey = session ? `payment:user:${session.userId}` : `payment:guest:${guestId}`;
  if (!checkRateLimit(rateLimitKey)) {
    return NextResponse.json(
      { message: "Trop de tentatives. Réessayez dans 5 minutes." },
      { status: 429 },
    );
  }

  try {
    const filter = buildCvAccessFilter(cvId, session, guestId);
    if (!filter) {
      return NextResponse.json(
        { message: "CV introuvable ou accès refusé." },
        { status: 404 },
      );
    }

    const cv = await CVModel.findOne(filter);
    if (!cv) {
      return NextResponse.json(
        { message: "CV introuvable ou accès refusé." },
        { status: 404 },
      );
    }

    const existingPayment = await getValidPaymentForCv(cvId);
    if (existingPayment) {
      return NextResponse.json(
        { message: "Ce CV a déjà un paiement valide.", data: { reference: existingPayment.reference } },
        { status: 409 },
      );
    }

    const paymentMethod = detectPaymentMethod(paymentPhone);
    const reference = `cvf-${randomUUID()}`;

    const payment = await PaymentModel.create({
      userId: session?.userId ?? null,
      guestId: session ? guestId : guestId,
      cvId,
      amount: paymentAmount,
      status: "pending",
      reference,
      paymentPhone,
      paymentMethod,
      metadata: {
        attempts: 1,
        lastErrorMessage: "",
        lastAttemptAt: new Date(),
      },
    });

    try {
      const transaction = await createNotchPayTransaction({
        amount: paymentAmount,
        reference,
        customer,
        paymentPhone,
        description: "Paiement CVFacile - téléchargement PDF",
      });

      const notchpayRef: string =
        transaction?.transaction?.reference ||
        transaction?.reference ||
        transaction?.data?.reference ||
        "";

      if (notchpayRef) {
        await PaymentModel.findByIdAndUpdate(payment._id, {
          transactionId: notchpayRef,
          status: "processing",
        });
      }

      auditEvent({
        action: "payment.initiate",
        userId: session?.userId || `guest:${guestId.slice(0, 8)}`,
        resource: `cv:${cvId}`,
        status: "success",
        meta: { reference: maskReference(reference) },
      });

      const response = NextResponse.json({
        data: {
          paymentId: payment._id,
          reference,
          checkoutUrl: transaction.authorization_url || transaction.checkout_url || "",
          action: transaction.action,
          ussdMessage: transaction.message,
        },
      });

      if (!session) {
        setGuestCookie(response, guestId);
      }

      return response;
    } catch (notchpayError) {
      const errorMessage =
        notchpayError instanceof Error ? notchpayError.message : "Erreur NotchPay";

      await PaymentModel.findByIdAndUpdate(payment._id, {
        $set: {
          status: "failed",
          metadata: {
            attempts: 1,
            lastErrorMessage: errorMessage,
            lastAttemptAt: new Date(),
          },
        },
      });

      auditEvent({
        action: "payment.initiate_failed",
        userId: session?.userId || `guest:${guestId.slice(0, 8)}`,
        resource: `cv:${cvId}`,
        status: "failure",
        meta: { reason: errorMessage },
      });
      log("error", "NotchPay initiate failed", { reason: errorMessage });
      return NextResponse.json({ message: errorMessage }, { status: 502 });
    }
  } catch (error) {
    log("error", "Payment initiate error", {
      error: error instanceof Error ? error.message : String(error),
    });
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ message }, { status: 500 });
  }
}
