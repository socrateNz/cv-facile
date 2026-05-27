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
    color: "text-blue-600"
  },
  {
    label: "Utilisateurs",
    href: "/admin/users",
    icon: Users,
    color: "text-green-600"
  },
  {
    label: "CV",
    href: "/admin/cvs",
    icon: FileText,
    color: "text-purple-600"
  },
  {
    label: "Paiements",
    href: "/admin/payments",
    icon: CreditCard,
    color: "text-amber-600"
  },
  {
    label: "Statistiques",
    href: "/admin/stats",
    icon: BarChart3,
    color: "text-cyan-600"
  },
  {
    label: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
    color: "text-gray-600"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-bold text-gray-900">CVFacile Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleMobileMenu}
          />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50 lg:hidden animate-in slide-in-from-left duration-300">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Shield className="w-8 h-8 text-primary" />
                  <div>
                    <h1 className="font-bold text-gray-900">CVFacile</h1>
                    <p className="text-xs text-gray-500">Administration</p>
                  </div>
                </div>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
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
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-white" : item.color}`} />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-gray-100">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200">
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
        className={`fixed left-0 top-0 bottom-0 bg-white shadow-xl transition-all duration-300 z-30 hidden lg:block ${isSidebarOpen ? "w-64" : "w-20"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center gap-3 p-4 border-b border-gray-100 ${!isSidebarOpen && "justify-center"}`}>
            <Shield className="w-8 h-8 text-primary flex-shrink-0" />
            {isSidebarOpen && (
              <div>
                <h1 className="font-bold text-gray-900">CVFacile</h1>
                <p className="text-xs text-gray-500">Administration</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                    } ${!isSidebarOpen && "justify-center"}`}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : item.color}`} />
                  {isSidebarOpen && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`p-4 border-t border-gray-100 ${!isSidebarOpen && "flex justify-center"}`}>
            {isSidebarOpen ? (
              <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Déconnexion</span>
              </button>
            ) : (
              <button className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200">
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
          } pt-16 lg:pt-0`}
      >
        <div className="min-h-screen px-4 py-8 lg:py-8">
          <div className="max-w-[80vw] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}