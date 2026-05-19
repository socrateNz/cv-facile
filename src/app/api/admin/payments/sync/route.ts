import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { PaymentModel } from "@/models/Payment";
import { getSessionUser, assertRole } from "@/lib/auth";
import { fetchNotchPayPayment } from "@/lib/notchpay";

/**
 * POST /api/admin/payments/sync
 * Vérifie le statut des paiements en cours auprès de NotchPay
 * et met à jour la BD si le paiement est terminé.
 */
export async function POST(req: NextRequest) {
  await connectToDatabase();
  const session = getSessionUser(req);
  if (!session || !assertRole(session.role, "admin")) {
    return NextResponse.json({ message: "Accès admin requis." }, { status: 403 });
  }

  const pendingPayments = await PaymentModel.find({
    status: { $in: ["pending", "processing"] },
  }).lean();

  if (pendingPayments.length === 0) {
    return NextResponse.json({ message: "Aucun paiement en attente.", synced: 0 });
  }

  let synced = 0;
  const results: { reference: string; notchpayStatus: string; updated: boolean }[] = [];

  for (const payment of pendingPayments) {
    try {
      // Use transactionId (Notchpay reference) instead of our internal reference
      const queryRef = payment.transactionId || payment.reference;
      const live = await fetchNotchPayPayment(queryRef);
      if (!live) {
        results.push({ reference: payment.reference, notchpayStatus: "erreur api", updated: false });
        continue;
      }

      const { rawStatus: notchpayStatus, mappedStatus } = live;

      if (mappedStatus === "completed") {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await PaymentModel.findOneAndUpdate(
          { reference: payment.reference },
          {
            status: "completed",
            transactionId: queryRef,
            completedAt: new Date(),
            expiresAt,
          },
        );
        synced++;
        results.push({ reference: payment.reference, notchpayStatus, updated: true });
      } else if (mappedStatus === "failed" || mappedStatus === "expired") {
        await PaymentModel.findOneAndUpdate(
          { reference: payment.reference },
          { status: mappedStatus, transactionId: queryRef },
        );
        synced++;
        results.push({ reference: payment.reference, notchpayStatus, updated: true });
      } else {
        results.push({ reference: payment.reference, notchpayStatus, updated: false });
      }
    } catch (error) {
      console.error(`[Sync] Exception for payment ${payment.reference}:`, error);
      results.push({ reference: payment.reference, notchpayStatus: "exception", updated: false });
    }
  }

  return NextResponse.json({
    message: `${synced} paiement(s) mis à jour sur ${pendingPayments.length}.`,
    synced,
    total: pendingPayments.length,
    results,
  });
}
