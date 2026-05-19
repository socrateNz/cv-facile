"use client";

import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  Activity,
  Calendar,
  DollarSign,
  UserCheck,
  FileCheck,
  Clock,
  ArrowUp,
  ArrowDown
} from "lucide-react";

type Stats = {
  usersCount: number;
  cvsCount: number;
  revenue: number;
  recentUsers?: Array<{ _id: string; fullName: string; email: string; createdAt: string }>;
  recentCVs?: Array<{ _id: string; fullName: string; title: string; createdAt: string }>;
  paymentsThisMonth?: number;
  usersGrowth?: number;
  cvsGrowth?: number;
  revenueGrowth?: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    usersCount: 0,
    cvsCount: 0,
    revenue: 0,
    recentUsers: [],
    recentCVs: [],
    paymentsThisMonth: 0,
    usersGrowth: 0,
    cvsGrowth: 0,
    revenueGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/admin/stats", {
          headers: { "x-user-role": "admin" },
        });
        if (!response.ok) return;
        const payload = await response.json();
        setStats(payload.data);
      } catch (error) {
        console.error("Erreur lors du chargement des stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('XAF', 'FCFA');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Tableau de bord
        </h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de votre plateforme</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Utilisateurs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            {stats.usersGrowth && (
              <div className={`flex items-center gap-1 text-sm font-medium ${stats.usersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.usersGrowth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(stats.usersGrowth)}%
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Utilisateurs</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{formatNumber(stats.usersCount)}</p>
            <p className="text-xs text-gray-400 mt-2">Total inscrits</p>
          </div>
        </div>

        {/* CV Créés */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            {stats.cvsGrowth && (
              <div className={`flex items-center gap-1 text-sm font-medium ${stats.cvsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.cvsGrowth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(stats.cvsGrowth)}%
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">CV créés</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{formatNumber(stats.cvsCount)}</p>
            <p className="text-xs text-gray-400 mt-2">Total documents</p>
          </div>
        </div>

        {/* Revenus */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            {stats.revenueGrowth && (
              <div className={`flex items-center gap-1 text-sm font-medium ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.revenueGrowth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(stats.revenueGrowth)}%
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Revenus</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(stats.revenue)}</p>
            <p className="text-xs text-gray-400 mt-2">Total généré</p>
          </div>
        </div>

        {/* Paiements ce mois */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Paiements ce mois</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{formatNumber(stats.paymentsThisMonth || 0)}</p>
            <p className="text-xs text-gray-400 mt-2">Transactions validées</p>
          </div>
        </div>
      </div>

      {/* Statistiques supplémentaires */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Taux de conversion */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Taux de conversion</h3>
              <p className="text-xs text-gray-500">Utilisateurs vers paiements</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Taux de conversion</span>
                <span className="font-semibold text-gray-900">
                  {stats.usersCount > 0 ? ((stats.paymentsThisMonth || 0) / stats.usersCount * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${stats.usersCount > 0 ? ((stats.paymentsThisMonth || 0) / stats.usersCount * 100) : 0}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Panier moyen</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.usersCount > 0 ? formatCurrency(stats.revenue / (stats.paymentsThisMonth || 1)) : formatCurrency(0)}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">CV par utilisateur</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.usersCount > 0 ? (stats.cvsCount / stats.usersCount).toFixed(1) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Activité récente</h3>
              <p className="text-xs text-gray-500">Dernières actions</p>
            </div>
          </div>
          <div className="space-y-3">
            {stats.recentUsers && stats.recentUsers.slice(0, 3).map((user) => (
              <div key={user._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500">Nouvel utilisateur</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            ))}
            {stats.recentCVs && stats.recentCVs.slice(0, 2).map((cv) => (
              <div key={cv._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileCheck className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{cv.fullName}</p>
                  <p className="text-xs text-gray-500">Nouveau CV créé</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(cv.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <button className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white hover:shadow-lg transition-all">
          <div>
            <p className="font-semibold">Gérer les utilisateurs</p>
            <p className="text-sm opacity-90">Voir tous les comptes</p>
          </div>
          <Users className="w-6 h-6" />
        </button>
        <button className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white hover:shadow-lg transition-all">
          <div>
            <p className="font-semibold">Exporter les données</p>
            <p className="text-sm opacity-90">Rapport CSV</p>
          </div>
          <FileText className="w-6 h-6" />
        </button>
        <button className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl text-white hover:shadow-lg transition-all">
          <div>
            <p className="font-semibold">Voir les transactions</p>
            <p className="text-sm opacity-90">Historique des paiements</p>
          </div>
          <CreditCard className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}