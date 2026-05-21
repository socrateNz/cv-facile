const NOTCHPAY_BASE_URL = process.env.NOTCHPAY_BASE_URL || "https://api.notchpay.co";

/** Clé publique NotchPay (header Authorization). Accepte NOTCHPAY_PUBLIC_KEY ou NOTCHPAY_API_KEY. */
export function getNotchPayPublicKey(): string {
  const raw =
    process.env.NOTCHPAY_PUBLIC_KEY?.trim() ||
    process.env.NOTCHPAY_API_KEY?.trim() ||
    "";

  const key = raw.replace(/^["']|["']$/g, "");

  if (!key) {
    throw new Error(
      "Configuration NotchPay manquante : définissez NOTCHPAY_PUBLIC_KEY dans .env (clé publique depuis business.notchpay.co → Settings → API Keys).",
    );
  }

  return key;
}

/** Message utilisateur pour les erreurs d'authentification NotchPay */
export function translateNotchPayError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("invalid api") ||
    lower.includes("invalid credentials") ||
    lower.includes("unauthorized") ||
    lower.includes("api key")
  ) {
    return (
      "Clé API NotchPay invalide. Utilisez la clé PUBLIQUE de test (préfixe test_) depuis " +
      "https://business.notchpay.co → Settings → API Keys, puis redémarrez le serveur (npm run dev)."
    );
  }
  return message;
}

export type PaymentDbStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "expired";

/** Convertit le statut NotchPay (complete, failed, …) vers notre modèle MongoDB */
export function mapNotchPayStatus(raw: string | undefined): PaymentDbStatus | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (s === "complete" || s === "completed" || s === "success") return "completed";
  if (s === "failed" || s === "error") return "failed";
  if (s === "canceled" || s === "cancelled") return "failed";
  if (s === "expired") return "expired";
  if (s === "pending" || s === "processing" || s === "initiated") return "processing";
  return null;
}

/** Récupère le statut d'une transaction chez NotchPay (référence trx.xxx) */
export async function fetchNotchPayPayment(notchPayRef: string): Promise<{
  rawStatus: string;
  mappedStatus: PaymentDbStatus | null;
} | null> {
  const res = await fetch(`${NOTCHPAY_BASE_URL}/payments/${notchPayRef}`, {
    headers: { Authorization: getNotchPayPublicKey() },
  });
  if (!res.ok) return null;

  const data = await res.json();
  const rawStatus: string =
    data?.transaction?.status || data?.status || "";
  return { rawStatus, mappedStatus: mapNotchPayStatus(rawStatus) };
}

/** Détecte le canal Mobile Money à partir du préfixe camerounais */
export function detectPaymentMethod(phone: string): "mtn" | "orange" {
  const digits = phone.replace(/[\s+]/g, "").replace(/^237/, "");
  
  if (/^(650|651|652|653|654|67|68)/.test(digits)) return "mtn";
  if (/^(655|656|657|658|659|69|64)/.test(digits)) return "orange";
  
  return "mtn"; // Default to MTN
}

function getChannel(paymentMethod: "mtn" | "orange"): string {
  return paymentMethod === "mtn" ? "cm.mtn" : "cm.orange";
}

/** Normalise le numéro en format international +237XXXXXXXXX */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/[\s+\-()]/g, "");
  if (digits.startsWith("237")) return `+${digits}`;
  return `+237${digits}`;
}

export async function createNotchPayTransaction(params: {
  amount: number;
  reference: string;
  customer: string;
  paymentPhone: string;
  description: string;
}) {
  const publicKey = getNotchPayPublicKey();

  const phone = normalizePhone(params.paymentPhone);
  const paymentMethod = detectPaymentMethod(params.paymentPhone);
  const channel = getChannel(paymentMethod);
  
  const headers = {
    Authorization: publicKey,
    "Content-Type": "application/json",
  };

  // ── Étape 1 : Créer la transaction ──────────────────────────────────────
  const initRes = await fetch(`${NOTCHPAY_BASE_URL}/payments`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      amount: params.amount,
      reference: params.reference,
      currency: "XAF",
      description: params.description,
      customer: {
        email: params.customer,
        phone,
      },
      callback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/notchpay`,
    }),
  });

  if (!initRes.ok) {
    const text = await initRes.text();
    let errorMessage = "Échec d'initialisation du paiement.";
    try {
      const errPayload = JSON.parse(text);
      if (errPayload.message) errorMessage = errPayload.message;
    } catch {
      errorMessage = "Service de paiement temporairement indisponible.";
    }
    throw new Error(translateNotchPayError(errorMessage));
  }

  const initData = await initRes.json();

  // Référence interne NotchPay (trx.xxx) retournée dans la réponse
  const trxRef: string =
    initData?.transaction?.reference ||
    initData?.reference ||
    initData?.data?.reference ||
    "";

  if (!trxRef) {
    console.warn("[NotchPay] Aucune référence trx dans la réponse initiale.");
    return initData;
  }

  // ── Étape 2 : Déclencher le push USSD Mobile Money ──────────────────────
  const completeRes = await fetch(`${NOTCHPAY_BASE_URL}/payments/${trxRef}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      channel,
      data: { phone },
    }),
  });

  if (!completeRes.ok) {
    const text = await completeRes.text();
    let errorMessage = "Échec de l'initialisation Mobile Money.";
    try {
      const errPayload = JSON.parse(text);
      if (errPayload.message === "Payment Not Found" || completeRes.status === 404) {
        errorMessage = "Le numéro de téléphone est invalide, incorrect ou l'opérateur n'est pas pris en charge.";
      } else if (errPayload.message) {
        errorMessage = errPayload.message;
      }
    } catch {
      errorMessage = "Erreur réseau ou numéro de paiement invalide.";
    }
    throw new Error(translateNotchPayError(errorMessage));
  }

  const completeData = await completeRes.json();
  return { ...initData, ...completeData, transaction: initData?.transaction };
}
