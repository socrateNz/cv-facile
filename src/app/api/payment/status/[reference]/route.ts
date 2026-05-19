import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { fetchNotchPayPayment } from "@/lib/notchpay";
import { PaymentModel } from "@/models/Payment";

const TERMINAL_STATUSES = new Set(["completed", "failed", "expired"]);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reference: string }> },
) {
  await connectToDatabase();
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ message: "Authentification requise." }, { status: 401 });
  }

  const { reference } = await params;
  const payment = await PaymentModel.findOne({ reference });

  if (!payment) {
    return NextResponse.json({ message: "Paiement introuvable." }, { status: 404 });
  }

  // Synchroniser avec NotchPay tant que le paiement n'est pas terminé
  if (!TERMINAL_STATUSES.has(payment.status)) {
    const notchPayRef = payment.transactionId || payment.reference;
    try {
      const live = await fetchNotchPayPayment(notchPayRef);
      if (live?.mappedStatus && live.mappedStatus !== payment.status) {
        payment.status = live.mappedStatus;
        if (live.mappedStatus === "completed") {
          payment.completedAt = new Date();
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);
          payment.expiresAt = expiresAt;
        }
        await payment.save();
      }
    } catch (e) {
      console.error("[NotchPay Polling] Erreur lors de la vérification:", e);
    }
  }

  const status = payment.status;
  const isTerminal = TERMINAL_STATUSES.has(status);

  return NextResponse.json({
    data: {
      status,
      completed: status === "completed",
      failed: status === "failed" || status === "expired",
      terminal: isTerminal,
    },
  });
}
