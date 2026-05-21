import type { SessionUser } from "@/lib/auth";
import { buildCvAccessFilter, getGuestId } from "@/lib/guest";
import { CVModel } from "@/models/CV";
import { PaymentModel } from "@/models/Payment";

/** Paiement valide (complété et non expiré) pour un CV */
export async function getValidPaymentForCv(cvId: string) {
  const payment = await PaymentModel.findOne({
    cvId,
    status: "completed",
    deletedAt: null,
  })
    .sort({ completedAt: -1 })
    .lean<{ expiresAt?: Date | null; reference?: string } | null>();

  if (!payment) return null;

  if (payment.expiresAt && new Date() > new Date(payment.expiresAt)) {
    return null;
  }

  return payment;
}

export async function userCanAccessCv(
  cvId: string,
  session: SessionUser | null,
  guestId: string | null,
): Promise<boolean> {
  const filter = buildCvAccessFilter(cvId, session, guestId);
  if (!filter) return false;
  const cv = await CVModel.findOne(filter).lean();
  return !!cv;
}

