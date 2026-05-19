import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { PaymentModel } from "@/models/Payment";
import { CVModel } from "@/models/CV";
import { auditEvent } from "@/lib/audit";
import { log, maskReference } from "@/lib/logger";

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 5000]; // exponential backoff

async function updatePaymentWithRetry(
  reference: string,
  updates: Record<string, any>,
  attempt: number = 0
): Promise<any> {
  try {
    const updated = await PaymentModel.findOneAndUpdate(
      { reference },
      { $set: updates },
      { new: true }
    );
    return updated;
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAYS[attempt] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
      log("warn", "Webhook payment update retry", {
        attempt: attempt + 1,
        reference: maskReference(reference),
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
      return updatePaymentWithRetry(reference, updates, attempt + 1);
    }
    throw error;
  }
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const body = await req.json();
  const eventReference = body?.data?.reference || body?.reference;
  const eventStatus = body?.data?.status || body?.status;
  const transactionId = body?.data?.id || "";

  log("info", "Webhook NotchPay received", {
    reference: eventReference ? maskReference(eventReference) : null,
    status: eventStatus,
  });

  if (!eventReference) {
    log("error", "Webhook NotchPay missing reference");
    return NextResponse.json(
      { message: "Référence absente." },
      { status: 400 }
    );
  }

  // Check if payment exists
  const payment = await PaymentModel.findOne({ reference: eventReference });
  if (!payment) {
    log("warn", "Webhook payment not found", {
      reference: maskReference(eventReference),
    });
    return NextResponse.json({ ok: true }); // Still return 200 for idempotency
  }

  // Handle payment completion
  if (
    eventStatus === "complete" ||
    eventStatus === "completed" ||
    eventStatus === "success"
  ) {
    const completedAt = new Date();
    const expiresAt = new Date(completedAt);
    expiresAt.setDate(expiresAt.getDate() + 30); // 30-day expiry

    try {
      await updatePaymentWithRetry(eventReference, {
        status: "completed",
        completedAt,
        expiresAt,
        transactionId,
        metadata: {
          attempts: payment.metadata?.attempts || 1,
          lastErrorMessage: "",
          lastAttemptAt: payment.metadata?.lastAttemptAt || new Date(),
        },
      });

      // Update CV status to ready for download
      await CVModel.findByIdAndUpdate(payment.cvId, { status: "published" });

      auditEvent({
        action: "payment.webhook",
        userId: String(payment.userId),
        resource: `payment:${eventReference}`,
        status: "success",
        meta: { eventStatus, cvId: String(payment.cvId) },
      });
    } catch (error) {
      log("error", "Webhook payment update failed", {
        reference: maskReference(eventReference),
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json(
        { message: "Failed to update payment" },
        { status: 500 }
      );
    }
  }

  // Handle payment failure
  if (eventStatus === "failed" || eventStatus === "error") {
    try {
      await updatePaymentWithRetry(eventReference, {
        status: "failed",
        metadata: {
          attempts: (payment.metadata?.attempts || 0) + 1,
          lastErrorMessage: body?.message || "Payment failed",
          lastAttemptAt: new Date(),
        },
      });

      auditEvent({
        action: "payment.webhook",
        userId: String(payment.userId),
        resource: `payment:${eventReference}`,
        status: "failure",
        meta: { eventStatus },
      });
    } catch (error) {
      log("error", "Webhook mark payment failed", {
        reference: maskReference(eventReference),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return NextResponse.json({ ok: true });
}
