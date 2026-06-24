"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, LogOut, User, Settings, ChevronDown, Loader2 } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  fullName: string;
  role?: string;
}

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchUserSession();
  }, []);

  const fetchUserSession = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const payload = await response.json();
        if (payload?.data) {
          setUser(payload.data);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        setUser(null);
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".user-dropdown")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/60 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20">
      <nav className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">CVFacile</span>
        </Link>

        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            <span className="text-sm text-slate-400">Chargement...</span>
          </div>
        ) : user ? (
          <div className="relative user-dropdown">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 rounded-xl px-3 py-2 shadow-sm"
            >
              <div className="w-7 h-7 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                <User className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-slate-200 max-w-37.5 truncate">
                {user.fullName || user.email}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-xs text-slate-400 mb-1">Connecté en tant que</p>
                  <p className="text-sm font-bold text-white truncate">
                    {user.fullName || user.email}
                  </p>
                  {user.email && user.fullName && (
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  )}
                </div>

                <div className="py-1">
                  <Link
                    href="/my-cvs"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Mes CV
                  </Link>

                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4 text-fuchsia-400" />
                      Administration
                    </Link>
                  )}
                </div>

                <div className="border-t border-white/10 mt-1 py-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/templates"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Créer un CV
            </Link>
            <Link
              href="/auth/login"
              className="group flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 active:scale-95 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
            >
              <FileText className="w-4 h-4 transition-transform group-hover:-rotate-12" />
              Connexion
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}