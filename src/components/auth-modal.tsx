"use client";

import { useEffect, useState } from "react";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  User,
  Check,
  Loader2,
} from "lucide-react";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role?: string;
};

type AuthModalProps = {
  isOpen: boolean;
  mode: "login" | "register";
  onClose: () => void;
  onSuccess?: (user: AuthUser) => void;
  onSwitchMode?: (mode: "login" | "register") => void;
  defaultEmail?: string;
  defaultFullName?: string;
};

const fetchOpts = { credentials: "include" as const };

export function AuthModal({
  isOpen,
  mode,
  onClose,
  onSuccess,
  onSwitchMode,
  defaultEmail = "",
  defaultFullName = "",
}: AuthModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(defaultFullName);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setPassword("");
    setConfirmPassword("");
    setEmail(defaultEmail);
    setFullName(defaultFullName);
  }, [isOpen, mode, defaultEmail, defaultFullName]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const passwordValidation = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const registerValid =
    fullName.trim() &&
    email.trim() &&
    isPasswordValid &&
    password === confirmPassword &&
    agreeTerms;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        ...fetchOpts,
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.message || "Connexion impossible.");
        return;
      }
      onSuccess?.(payload.data);
      onClose();
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!registerValid) {
      setError("Veuillez remplir correctement tous les champs.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        ...fetchOpts,
        body: JSON.stringify({ fullName, email, password }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.message || "Inscription impossible.");
        return;
      }
      onSuccess?.(payload.data);
      onClose();
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 z-10"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 pt-8">
          <h2
            id="auth-modal-title"
            className="text-xl font-bold text-gray-900 pr-8"
          >
            {mode === "login" ? "Se connecter" : "Créer un compte"}
          </h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            {mode === "login"
              ? "Vos données du formulaire restent en place."
              : "Sauvegardez ce CV et retrouvez-le plus tard."}
          </p>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field label="Email" icon={Mail}>
                <input
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </Field>
              <Field label="Mot de passe" icon={Lock}>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`${inputClass} pr-11`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <PasswordToggle
                    show={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                  />
                </div>
              </Field>
              {error && <ErrorBox message={error} />}
              <SubmitButton
                loading={isLoading}
                icon={LogIn}
                label="Se connecter"
              />
              <p className="text-center text-sm text-gray-600">
                Pas de compte ?{" "}
                <button
                  type="button"
                  className="text-indigo-600 font-semibold hover:underline"
                  onClick={() => onSwitchMode?.("register")}
                >
                  Créer un compte
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <Field label="Nom complet" icon={User}>
                <input
                  type="text"
                  className={inputClass}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="name"
                />
              </Field>
              <Field label="Email" icon={Mail}>
                <input
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </Field>
              <Field label="Mot de passe" icon={Lock}>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`${inputClass} pr-11`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <PasswordToggle
                    show={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                  />
                </div>
              </Field>
              {password && (
                <ul className="text-xs text-gray-500 space-y-1 grid grid-cols-2 gap-1">
                  {(
                    [
                      { label: "8 caractères min.", ok: passwordValidation.minLength },
                      { label: "Une majuscule", ok: passwordValidation.hasUpperCase },
                      { label: "Une minuscule", ok: passwordValidation.hasLowerCase },
                      { label: "Un chiffre", ok: passwordValidation.hasNumber },
                    ] as const
                  ).map(({ label, ok }) => (
                    <li
                      key={label}
                      className={ok ? "text-green-600" : "text-gray-400"}
                    >
                      {ok ? "✓" : "○"} {label}
                    </li>
                  ))}
                </ul>
              )}
              <Field label="Confirmer le mot de passe" icon={Lock}>
                <input
                  type="password"
                  className={inputClass}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </Field>
              <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300"
                />
                J&apos;accepte les conditions d&apos;utilisation
              </label>
              {error && <ErrorBox message={error} />}
              <SubmitButton
                loading={isLoading}
                icon={UserPlus}
                label="Créer mon compte"
                disabled={!registerValid}
              />
              <p className="text-center text-sm text-gray-600">
                Déjà inscrit ?{" "}
                <button
                  type="button"
                  className="text-indigo-600 font-semibold hover:underline"
                  onClick={() => onSwitchMode?.("login")}
                >
                  Se connecter
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
        {children}
      </div>
    </div>
  );
}

function PasswordToggle({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      tabIndex={-1}
    >
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
      {message}
    </p>
  );
}

function SubmitButton({
  loading,
  icon: Icon,
  label,
  disabled,
}: {
  loading: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full rounded-xl bg-indigo-600 py-2.5 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      {label}
    </button>
  );
}
