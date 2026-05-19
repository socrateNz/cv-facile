"use client";

import { useEffect, useState } from "react";
import {
    TrendingUp,
    Users,
    FileText,
    CreditCard,
    Calendar,
    ArrowUp,
    ArrowDown,
    BarChart3,
    PieChart,
    Activity,
    Download,
    RefreshCw,
    DollarSign,
    UserCheck,
    FileCheck,
    Clock
} from "lucide-react";
import Link from "next/link";

type StatsData = {
    usersCount: number;
    cvsCount: number;
    revenue: number;
    paymentsThisMonth?: number;
    usersGrowth?: number;
    cvsGrowth?: number;
    revenueGrowth?: number;
    recentUsers?: Array<{ _id: string; fullName: string; email: string; createdAt: string }>;
    recentCVs?: Array<{ _id: string; fullName: string; title: string; createdAt: string }>;
};

export default function AdminStatsPage() {
    const [stats, setStats] = useState<StatsData>({
        usersCount: 0,
        cvsCount: 0,
        revenue: 0,
        paymentsThisMonth: 0,
        usersGrowth: 0,
        cvsGrowth: 0,
        revenueGrowth: 0,
        recentUsers: [],
        recentCVs: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState<"week" | "month" | "year">("month");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStats();
    }, [period]);

    async function loadStats() {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/admin/stats?period=${period}`);
            if (!response.ok) throw new Error("Erreur lors du chargement des statistiques");
            const payload = await response.json();

            // S'assurer que toutes les données sont présentes
            setStats({
                usersCount: payload.data?.usersCount || 0,
                cvsCount: payload.data?.cvsCount || 0,
                revenue: payload.data?.revenue || 0,
                paymentsThisMonth: payload.data?.paymentsThisMonth || 0,
                usersGrowth: payload.data?.usersGrowth || 0,
                cvsGrowth: payload.data?.cvsGrowth || 0,
                revenueGrowth: payload.data?.revenueGrowth || 0,
                recentUsers: payload.data?.recentUsers || [],
                recentCVs: payload.data?.recentCVs || []
            });
        } catch (err) {
            console.error("Erreur:", err);
            setError(err instanceof Error ? err.message : "Erreur de chargement");
        } finally {
            setIsLoading(false);
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR').format(amount) + " FCFA";
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('fr-FR').format(num);
    };

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

    if (error) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <button
                    onClick={loadStats}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
                >
                    <RefreshCw className="w-4 h-4" />
                    Réessayer
                </button>
            </div>
        );
    }

    // Template stats fictives (à remplacer par des données réelles de l'API si disponibles)
    const templateStats = {
        modern: Math.round(stats.cvsCount * 0.5),
        classic: Math.round(stats.cvsCount * 0.3),
        premium: Math.round(stats.cvsCount * 0.2)
    };

    const conversionRate = stats.usersCount > 0
        ? ((stats.paymentsThisMonth || 0) / stats.usersCount * 100).toFixed(1)
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Statistiques globales
                    </h1>
                    <p className="text-gray-600 mt-2">Analyse détaillée de votre plateforme</p>
                </div>

                <div className="flex gap-2">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as any)}
                        className="px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-400 transition-all"
                    >
                        <option value="week">7 derniers jours</option>
                        <option value="month">30 derniers jours</option>
                        <option value="year">12 derniers mois</option>
                    </select>

                    <button
                        onClick={loadStats}
                        className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
                        title="Rafraîchir"
                    >
                        <RefreshCw className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Main KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Utilisateurs */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        {(stats.usersGrowth !== undefined && stats.usersGrowth !== 0) && (
                            <div className={`flex items-center gap-1 text-sm font-medium ${stats.usersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stats.usersGrowth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                {Math.abs(stats.usersGrowth)}%
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Utilisateurs</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{formatNumber(stats.usersCount)}</p>
                        <p className="text-xs text-gray-400 mt-2">
                            Total inscrits
                        </p>
                    </div>
                </div>

                {/* CV Créés */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        {(stats.cvsGrowth !== undefined && stats.cvsGrowth !== 0) && (
                            <div className={`flex items-center gap-1 text-sm font-medium ${stats.cvsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stats.cvsGrowth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                {Math.abs(stats.cvsGrowth)}%
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">CV créés</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{formatNumber(stats.cvsCount)}</p>
                        <p className="text-xs text-gray-400 mt-2">
                            Total documents
                        </p>
                    </div>
                </div>

                {/* Revenus */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        {(stats.revenueGrowth !== undefined && stats.revenueGrowth !== 0) && (
                            <div className={`flex items-center gap-1 text-sm font-medium ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stats.revenueGrowth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                {Math.abs(stats.revenueGrowth)}%
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Revenus totaux</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(stats.revenue)}</p>
                        <p className="text-xs text-gray-400 mt-2">
                            {formatCurrency(stats.paymentsThisMonth || 0)} ce mois
                        </p>
                    </div>
                </div>

                {/* Taux de conversion */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Taux de conversion</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{conversionRate}%</p>
                        <p className="text-xs text-gray-400 mt-2">
                            {stats.paymentsThisMonth || 0} paiements ce mois
                        </p>
                    </div>
                </div>
            </div>

            {/* Graphiques et analyses */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Répartition des templates */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                            <PieChart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Templates populaires</h3>
                            <p className="text-xs text-gray-500">Répartition par modèle</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Modern</span>
                                <span className="font-semibold text-gray-900">
                                    {stats.cvsCount > 0 ? Math.round((templateStats.modern / stats.cvsCount) * 100) : 0}%
                                </span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                    style={{ width: `${stats.cvsCount > 0 ? (templateStats.modern / stats.cvsCount) * 100 : 0}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{templateStats.modern} CV</p>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Classic</span>
                                <span className="font-semibold text-gray-900">
                                    {stats.cvsCount > 0 ? Math.round((templateStats.classic / stats.cvsCount) * 100) : 0}%
                                </span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gray-600 rounded-full transition-all duration-500"
                                    style={{ width: `${stats.cvsCount > 0 ? (templateStats.classic / stats.cvsCount) * 100 : 0}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{templateStats.classic} CV</p>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Premium</span>
                                <span className="font-semibold text-gray-900">
                                    {stats.cvsCount > 0 ? Math.round((templateStats.premium / stats.cvsCount) * 100) : 0}%
                                </span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                                    style={{ width: `${stats.cvsCount > 0 ? (templateStats.premium / stats.cvsCount) * 100 : 0}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{templateStats.premium} CV</p>
                        </div>
                    </div>

                    {/* Ratio CV/Utilisateur */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">CV par utilisateur</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.usersCount > 0 ? (stats.cvsCount / stats.usersCount).toFixed(1) : 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Panier moyen</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.paymentsThisMonth && stats.paymentsThisMonth > 0
                                        ? formatCurrency(stats.revenue / stats.paymentsThisMonth)
                                        : formatCurrency(0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activité récente */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Activité récente</h3>
                                <p className="text-xs text-gray-500">Dernières actions sur la plateforme</p>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                        {/* Nouveaux utilisateurs */}
                        {stats.recentUsers && stats.recentUsers.length > 0 && (
                            <>
                                <div className="px-6 py-3 bg-gray-50">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Nouveaux utilisateurs</p>
                                </div>
                                {stats.recentUsers.slice(0, 3).map((user) => (
                                    <div key={user._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <UserCheck className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Nouveaux CV */}
                        {stats.recentCVs && stats.recentCVs.length > 0 && (
                            <>
                                <div className="px-6 py-3 bg-gray-50">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Nouveaux CV</p>
                                </div>
                                {stats.recentCVs.slice(0, 3).map((cv) => (
                                    <div key={cv._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                <FileCheck className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{cv.fullName}</p>
                                                <p className="text-xs text-gray-500">{cv.title}</p>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {new Date(cv.createdAt).toLocaleDateString("fr-FR")}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {(!stats.recentUsers || stats.recentUsers.length === 0) &&
                            (!stats.recentCVs || stats.recentCVs.length === 0) && (
                                <div className="px-6 py-12 text-center">
                                    <p className="text-sm text-gray-500">Aucune activité récente</p>
                                </div>
                            )}
                    </div>
                </div>
            </div>

            {/* Export Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="font-semibold text-gray-900">Exporter les rapports</h3>
                        <p className="text-sm text-gray-500">Téléchargez les statistiques au format CSV</p>
                    </div>
                    <button
                        onClick={() => {
                            const csv = [
                                ["Métrique", "Valeur"],
                                ["Utilisateurs", stats.usersCount],
                                ["CV créés", stats.cvsCount],
                                ["Revenus totaux", stats.revenue],
                                ["Paiements ce mois", stats.paymentsThisMonth || 0],
                                ["Taux de conversion", `${conversionRate}%`]
                            ].map(row => row.join(",")).join("\n");

                            const blob = new Blob([csv], { type: "text/csv" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `statistiques_${new Date().toISOString().split("T")[0]}.csv`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
                    >
                        <Download className="w-4 h-4" />
                        Exporter CSV
                    </button>
                </div>
            </div>
        </div>
    );
}