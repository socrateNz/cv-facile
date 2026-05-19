import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { CVModel } from "@/models/CV";
import { PaymentModel } from "@/models/Payment";
import { createNotchPayTransaction, detectPaymentMethod } from "@/lib/notchpay";
import { paymentInitiateSchema } from "@/lib/validators";
import { auditEvent } from "@/lib/audit";
import { log, maskReference } from "@/lib/logger";

const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxAttempts: number = 3, windowMs: number = 5 * 60 * 1000): boolean {
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
  if (!session) {
    return NextResponse.json(
      { message: "Authentification requise." },
      { status: 401 }
    );
  }

  const { userId, email } = session;
  const body = await req.json();

  // Validate input
  const validation = paymentInitiateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { message: "Données invalides", errors: validation.error.flatten() },
      { status: 400 }
    );
  }

  const { cvId, paymentPhone } = validation.data;
  const customer = validation.data.customer || email;

  // Rate limiting
  const rateLimitKey = `payment:${userId}`;
  if (!checkRateLimit(rateLimitKey)) {
    return NextResponse.json(
      { message: "Trop de tentatives. Réessayez dans 5 minutes." },
      { status: 429 }
    );
  }

  try {
    // Verify CV exists and belongs to user
    const cv = await CVModel.findOne({ _id: cvId, userId, deletedAt: null });
    if (!cv) {
      return NextResponse.json(
        { message: "CV introuvable ou accès refusé." },
        { status: 404 }
      );
    }

    // Check if already paid
    const existingPayment = await PaymentModel.findOne({
      cvId,
      status: "completed",
      deletedAt: null,
    });

    if (existingPayment && existingPayment.expiresAt && new Date() < new Date(existingPayment.expiresAt)) {
      return NextResponse.json(
        { message: "Ce CV a déjà un paiement valide." },
        { status: 409 }
      );
    }

    // Detect payment method
    const paymentMethod = detectPaymentMethod(paymentPhone);

    // Create payment record
    const reference = `cvf-${randomUUID()}`;
    const payment = await PaymentModel.create({
      userId,
      cvId,
      amount: 500,
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
      // Initiate NotchPay transaction
      const transaction = await createNotchPayTransaction({
        amount: 500,
        reference,
        customer,
        paymentPhone,
        description: "Paiement CVFacile - téléchargement PDF",
      });

      // Save NotchPay transaction ID
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
        userId,
        resource: `cv:${cvId}`,
        status: "success",
        meta: { reference: maskReference(reference) },
      });

      return NextResponse.json({
        data: {
          paymentId: payment._id,
          reference,
          checkoutUrl: transaction.authorization_url || transaction.checkout_url || "",
          action: transaction.action,
          ussdMessage: transaction.message,
        },
      });
    } catch (notchpayError) {
      const errorMessage =
        notchpayError instanceof Error ? notchpayError.message : "Erreur NotchPay";

      // Update payment with error
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
        userId,
        resource: `cv:${cvId}`,
        status: "failure",
        meta: { reason: errorMessage },
      });
      log("error", "NotchPay initiate failed", { reason: errorMessage });
      return NextResponse.json(
        { message: errorMessage },
        { status: 502 }
      );
    }
  } catch (error) {
    log("error", "Payment initiate error", {
      error: error instanceof Error ? error.message : String(error),
    });
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
