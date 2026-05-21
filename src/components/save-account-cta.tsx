"use client";

import { useState } from "react";
import { UserPlus, LogIn, Cloud, Check } from "lucide-react";
import { AuthModal, type AuthUser } from "@/components/auth-modal";

type SaveAccountCtaProps = {
  cvId?: string;
  className?: string;
  defaultEmail?: string;
  defaultFullName?: string;
  onAuthSuccess?: (user: AuthUser) => void;
};

export function SaveAccountCta({
  cvId = "",
  className = "",
  defaultEmail = "",
  defaultFullName = "",
  onAuthSuccess,
}: SaveAccountCtaProps) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [saved, setSaved] = useState(false);

  function openAuth(mode: "login" | "register") {
    setAuthMode(mode);
    setAuthOpen(true);
  }

  function handleSuccess(user: AuthUser) {
    setSaved(true);
    onAuthSuccess?.(user);
  }

  if (saved) {
    return (
      <div
        className={`rounded-2xl border border-green-200 bg-green-50 p-6 flex items-center gap-3 ${className}`}
      >
        <Check className="w-6 h-6 text-green-600 shrink-0" />
        <div>
          <p className="font-semibold text-green-800">Compte connecté</p>
          <p className="text-sm text-green-700">
            Ce CV est lié à votre compte. Retrouvez-le dans « Mes CV ».
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 space-y-4 ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white p-2 shadow-sm">
            <Cloud className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Retrouvez ce CV plus tard
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Créez un compte gratuit pour sauvegarder vos CV en ligne, les modifier
              à tout moment et y accéder depuis n&apos;importe quel appareil.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => openAuth("register")}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Créer un compte
          </button>
          <button
            type="button"
            onClick={() => openAuth("login")}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Se connecter
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onSwitchMode={setAuthMode}
        onSuccess={handleSuccess}
        defaultEmail={defaultEmail}
        defaultFullName={defaultFullName}
      />
    </>
  );
}
