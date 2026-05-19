"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CreditCard,
  Loader2,
  X,
  Check,
  Download,
  Smartphone,
} from "lucide-react";
import { detectPaymentMethod } from "@/lib/notchpay";

const AMOUNT_FCFA = 500;

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cvId: string;
  customerEmail: string;
  onSuccess?: () => void;
};

type Phase = "form" | "waiting" | "success" | "failed";

const carrierLabels = {
  mtn: { name: "MTN Mobile Money", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  orange: { name: "Orange Money", color: "bg-orange-100 text-orange-800 border-orange-200" },
} as const;

export function PaymentModal({
  isOpen,
  onClose,
  cvId,
  customerEmail,
  onSuccess,
}: PaymentModalProps) {
  const [paymentPhone, setPaymentPhone] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ussdMessage, setUssdMessage] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const carrier = useMemo(
    () => (paymentPhone.trim() ? detectPaymentMethod(paymentPhone) : null),
    [paymentPhone],
  );

  useEffect(() => {
    if (!isOpen) {
      setPhase("form");
      setPaymentPhone("");
      setError(null);
      setUssdMessage(null);
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  async function checkPaymentStatus(reference: string) {
    const res = await fetch(`/api/payment/status/${reference}`);
    if (!res.ok) return;

    const data = await res.json();
    const payload = data?.data;

    if (payload?.completed) {
      stopPolling();
      setPhase("success");
      onSuccess?.();
    } else if (payload?.failed) {
      stopPolling();
      setPhase("failed");
    }
  }

  function startPolling(reference: string) {
    stopPolling();
    void checkPaymentStatus(reference);
    pollRef.current = setInterval(() => {
      void checkPaymentStatus(reference);
    }, 4000);

    setTimeout(stopPolling, 5 * 60 * 1000);
  }

  async function handlePay() {
    if (!paymentPhone.trim()) {
      setError("Veuillez saisir votre numéro Mobile Money.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/payment/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cvId,
        customer: customerEmail,
        paymentPhone: paymentPhone.trim(),
      }),
    });

    setIsLoading(false);

    if (!response.ok) {
      let message = "Paiement indisponible.";
      try {
        const payload = await response.json();
        message = payload?.message || message;
      } catch {
        const text = await response.text();
        if (text) message = text;
      }
      setError(message);
      return;
    }

    const payload = await response.json();
    const ref = payload?.data?.reference;
    const msg = payload?.data?.ussdMessage;

    if (ref) {
      if (msg) setUssdMessage(msg);
      setPhase("waiting");
      startPolling(ref);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => {
            stopPolling();
            onClose();
          }}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">Paiement sécurisé</h2>
              <p className="text-sm text-blue-100">MTN • Orange Money</p>
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold">{AMOUNT_FCFA} FCFA</p>
        </div>

        <div className="p-6 space-y-4">
          {phase === "form" && (
            <>
              {carrier && (
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${carrierLabels[carrier].color}`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  {carrierLabels[carrier].name}
                </span>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Numéro Mobile Money
                </label>
                <input
                  className="w-full rounded-xl border border-gray-200 p-3 text-lg tracking-wide focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="6XX XXX XXX"
                  type="tel"
                  value={paymentPhone}
                  onChange={(e) => {
                    setPaymentPhone(e.target.value);
                    setError(null);
                  }}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handlePay}
                disabled={isLoading || !paymentPhone.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-white font-semibold disabled:opacity-60 flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Initialisation...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Payer maintenant
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                Une demande USSD sera envoyée à votre téléphone pour confirmer
              </p>
            </>
          )}

          {phase === "waiting" && (
            <div className="text-center space-y-4 py-2">
              <div className="relative flex items-center justify-center mx-auto w-20 h-20">
                <div className="absolute w-20 h-20 rounded-full bg-blue-100 animate-pulse" />
                <div className="absolute w-20 h-20 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                <span className="relative text-3xl">📱</span>
              </div>
              <p className="font-semibold text-gray-900">
                Confirmation au{" "}
                <span className="text-blue-600">{paymentPhone}</span>
              </p>
              {ussdMessage && (
                <div className="p-3 bg-blue-50 text-blue-800 rounded-xl text-sm font-medium border border-blue-100">
                  {ussdMessage.includes("*126#")
                    ? "Composez *126# sur votre téléphone"
                    : "Composez #150*50# sur votre téléphone"}
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                En attente de confirmation…
              </div>
              <button
                type="button"
                onClick={() => {
                  stopPolling();
                  setPhase("form");
                }}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Annuler
              </button>
            </div>
          )}

          {phase === "failed" && (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto text-3xl">
                ❌
              </div>
              <p className="font-bold text-gray-900">Paiement échoué</p>
              <p className="text-sm text-gray-500">
                La transaction a été annulée ou le délai est dépassé.
              </p>
              <button
                type="button"
                onClick={() => setPhase("form")}
                className="w-full rounded-xl bg-red-50 py-3 text-red-600 font-semibold border border-red-200 hover:bg-red-100 transition-all"
              >
                Réessayer
              </button>
            </div>
          )}

          {phase === "success" && (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-bold text-green-800 text-lg">Paiement confirmé !</p>
              <p className="text-sm text-green-600">Votre CV est prêt à télécharger</p>
              <a
                href={`/api/cv/${cvId}/pdf`}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-white font-semibold hover:shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                Télécharger le PDF
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
