"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Download,
  BarChart3
} from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    color: "text-indigo-400"
  },
  {
    label: "Utilisateurs",
    href: "/admin/users",
    icon: Users,
    color: "text-emerald-400"
  },
  {
    label: "CV",
    href: "/admin/cvs",
    icon: FileText,
    color: "text-fuchsia-400"
  },
  {
    label: "Paiements",
    href: "/admin/payments",
    icon: CreditCard,
    color: "text-amber-400"
  },
  {
    label: "Statistiques",
    href: "/admin/stats",
    icon: BarChart3,
    color: "text-cyan-400"
  },
  {
    label: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
    color: "text-slate-400"
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans antialiased selection:bg-indigo-500/30">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-300" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-500" />
              <span className="font-bold text-white">CVFacile Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <LogOut className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={toggleMobileMenu}
          />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 shadow-2xl z-50 lg:hidden animate-in slide-in-from-left duration-300 border-r border-white/10">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Shield className="w-8 h-8 text-indigo-500" />
                  <div>
                    <h1 className="font-bold text-white">CVFacile</h1>
                    <p className="text-xs text-slate-400">Administration</p>
                  </div>
                </div>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                        ? "bg-indigo-600/20 text-indigo-300 shadow-md border border-indigo-500/30"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                        }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-indigo-400" : item.color}`} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-white/10">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 shadow-2xl transition-all duration-300 z-30 hidden lg:block ${isSidebarOpen ? "w-64" : "w-20"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center gap-3 p-4 border-b border-white/10 ${!isSidebarOpen && "justify-center"}`}>
            <Shield className="w-8 h-8 text-indigo-500 flex-shrink-0" />
            {isSidebarOpen && (
              <div>
                <h1 className="font-bold text-white">CVFacile</h1>
                <p className="text-xs text-slate-400">Administration</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                    ? "bg-indigo-600/20 text-indigo-300 shadow-md border border-indigo-500/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    } ${!isSidebarOpen && "justify-center"}`}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-indigo-400" : item.color}`} />
                  {isSidebarOpen && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`p-4 border-t border-white/10 ${!isSidebarOpen && "flex justify-center"}`}>
            {isSidebarOpen ? (
              <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Déconnexion</span>
              </button>
            ) : (
              <button className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200">
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 bg-slate-800 border border-white/20 text-slate-300 rounded-full p-1.5 shadow-lg hover:bg-slate-700 transition-all duration-200"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
          } pt-16 lg:pt-0`}
      >
        <div className="min-h-screen px-4 py-8 lg:py-8 relative z-10">
          <div className="max-w-[80vw] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}