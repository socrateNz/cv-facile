"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, ArrowRight, Shield, Check, X } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Validation du mot de passe
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const doPasswordsMatch = password === confirmPassword;
  const isFormValid = fullName && email && isPasswordValid && doPasswordsMatch && agreeTerms;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isFormValid) {
      setError("Veuillez remplir correctement tous les champs.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.message || "Inscription impossible.");
        setIsLoading(false);
        return;
      }

      router.push("/templates");
      router.refresh();
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50/30 flex items-center justify-center px-4 py-8">
      <div className="w-fit">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-r from-blue-600 to-purple-600 shadow-lg mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CV Facile
          </h1>
          <p className="text-gray-600 mt-2">Créez votre compte gratuitement</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={onSubmit} className="flex flex-row gap-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
          <div>
            <div className="space-y-4">
              {/* Full Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    type="text"
                    placeholder="Jean Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    className="w-full rounded-xl border border-gray-200 pl-10 pr-12 py-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Validation */}
                {password && (
                  <div className="mt-3 space-y-1.5 animate-in slide-in-from-top-1">
                    <p className="text-xs font-medium text-gray-600 mb-1">Le mot de passe doit contenir :</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`flex items-center gap-1.5 text-xs ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordValidation.minLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>8 caractères minimum</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordValidation.hasUpperCase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>Une majuscule</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordValidation.hasLowerCase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>Une minuscule</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordValidation.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>Un chiffre</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    className="w-full rounded-xl border border-gray-200 pl-10 pr-12 py-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && !doPasswordsMatch && (
                  <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top-1">
                    Les mots de passe ne correspondent pas
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  J&apos;accepte les{" "}
                  <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
                    conditions d&apos;utilisation
                  </button>{" "}
                  et la{" "}
                  <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
                    politique de confidentialité
                  </button>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 animate-in slide-in-from-top-1">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                className="w-full rounded-xl bg-linear-to-r from-blue-600 to-purple-600 py-3 text-white font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
                type="submit"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Création du compte...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    S&apos;inscrire
                  </>
                )}
              </button>
            </div>

            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">déjà inscrit ?</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 group transition-colors"
              >
                Se connecter à mon compte
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-4 p-4 bg-linear-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <p className="text-xs font-medium text-gray-700 mb-2 text-center">✨ Créer un compte vous permet de :</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Check className="w-3 h-3 text-green-600" />
                <span>Sauvegarder vos CV en ligne</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Check className="w-3 h-3 text-green-600" />
                <span>Générer des CV en PDF</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Check className="w-3 h-3 text-green-600" />
                <span>Modifier vos CV à tout moment</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Check className="w-3 h-3 text-green-600" />
                <span>Accéder à tous les templates premium</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}