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
    Clock,
    Sparkles
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

    const [insights, setInsights] = useState<string | null>(null);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);

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

    async function loadInsights() {
        setIsLoadingInsights(true);
        try {
            const response = await fetch('/api/admin/ai/insights');
            const data = await response.json();
            if (data.success && data.insights) {
                setInsights(data.insights);
            }
        } catch (err) {
            console.error("Erreur de chargement des insights", err);
        } finally {
            setIsLoadingInsights(false);
        }
    }

    useEffect(() => {
        // Charger les insights IA seulement au montage
        loadInsights();
    }, []);

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
                    <div className="w-16 h-16 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">Chargement des statistiques...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                    <BarChart3 className="w-10 h-10 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Erreur de chargement</h3>
                <p className="text-slate-400 mb-6">{error}</p>
                <button
                    onClick={loadStats}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
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
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
                        Statistiques globales
                    </h1>
                    <p className="text-slate-400 mt-2">Analyse détaillée de votre plateforme</p>
                </div>

                <div className="flex gap-2">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as any)}
                        className="px-4 py-2 rounded-xl bg-slate-900/50 backdrop-blur-xl border border-white/10 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all [&>option]:bg-slate-900"
                    >
                        <option value="week">7 derniers jours</option>
                        <option value="month">30 derniers jours</option>
                        <option value="year">12 derniers mois</option>
                    </select>

                    <button
                        onClick={loadStats}
                        className="p-2 rounded-xl bg-slate-900/50 backdrop-blur-xl border border-white/10 hover:bg-white/5 transition-all text-slate-400 hover:text-white"
                        title="Rafraîchir"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* AI Insights Card */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-pulse"></div>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30 shrink-0">
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            Analyse IA des Tendances
                            {isLoadingInsights && <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />}
                        </h3>
                        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {isLoadingInsights ? "Analyse des données en cours..." : insights ? insights : "Les insights IA ne sont pas disponibles pour le moment."}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Utilisateurs */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-indigo-400" />
                        </div>
                        {(stats.usersGrowth !== undefined && stats.usersGrowth !== 0) && (
                            <div className={`flex items-center gap-1 text-sm font-medium ${stats.usersGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {stats.usersGrowth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                {Math.abs(stats.usersGrowth)}%
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 font-medium">Utilisateurs</p>
                        <p className="text-3xl font-bold text-white mt-1">{formatNumber(stats.usersCount)}</p>
                        <p className="text-xs text-slate-500 mt-2">
                            Total inscrits
                        </p>
                    </div>
                </div>

                {/* CV Créés */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 p-6 hover:shadow-xl hover:shadow-fuchsia-500/10 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-fuchsia-400" />
                        </div>
                        {(stats.cvsGrowth !== undefined && stats.cvsGrowth !== 0) && (
                            <div className={`flex items-center gap-1 text-sm font-medium ${stats.cvsGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {stats.cvsGrowth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                {Math.abs(stats.cvsGrowth)}%
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 font-medium">CV créés</p>
                        <p className="text-3xl font-bold text-white mt-1">{formatNumber(stats.cvsCount)}</p>
                        <p className="text-xs text-slate-500 mt-2">
                            Total documents
                        </p>
                    </div>
                </div>

                {/* Revenus */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 p-6 hover:shadow-xl hover:shadow-emerald-500/10 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-emerald-400" />
                        </div>
                        {(stats.revenueGrowth !== undefined && stats.revenueGrowth !== 0) && (
                            <div className={`flex items-center gap-1 text-sm font-medium ${stats.revenueGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {stats.revenueGrowth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                {Math.abs(stats.revenueGrowth)}%
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 font-medium">Revenus totaux</p>
                        <p className="text-3xl font-bold text-white mt-1">{formatCurrency(stats.revenue)}</p>
                        <p className="text-xs text-slate-500 mt-2">
                            {formatCurrency(stats.paymentsThisMonth || 0)} ce mois
                        </p>
                    </div>
                </div>

                {/* Taux de conversion */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 p-6 hover:shadow-xl hover:shadow-amber-500/10 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-amber-400" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 font-medium">Taux de conversion</p>
                        <p className="text-3xl font-bold text-white mt-1">{conversionRate}%</p>
                        <p className="text-xs text-slate-500 mt-2">
                            {stats.paymentsThisMonth || 0} paiements ce mois
                        </p>
                    </div>
                </div>
            </div>

            {/* Graphiques et analyses */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Répartition des templates */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <PieChart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Templates populaires</h3>
                            <p className="text-xs text-slate-400">Répartition par modèle</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-300">Modern</span>
                                <span className="font-semibold text-white">
                                    {stats.cvsCount > 0 ? Math.round((templateStats.modern / stats.cvsCount) * 100) : 0}%
                                </span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                    style={{ width: `${stats.cvsCount > 0 ? (templateStats.modern / stats.cvsCount) * 100 : 0}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{templateStats.modern} CV</p>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-300">Classic</span>
                                <span className="font-semibold text-white">
                                    {stats.cvsCount > 0 ? Math.round((templateStats.classic / stats.cvsCount) * 100) : 0}%
                                </span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-slate-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(100,116,139,0.5)]"
                                    style={{ width: `${stats.cvsCount > 0 ? (templateStats.classic / stats.cvsCount) * 100 : 0}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{templateStats.classic} CV</p>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-300">Premium</span>
                                <span className="font-semibold text-white">
                                    {stats.cvsCount > 0 ? Math.round((templateStats.premium / stats.cvsCount) * 100) : 0}%
                                </span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-fuchsia-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]"
                                    style={{ width: `${stats.cvsCount > 0 ? (templateStats.premium / stats.cvsCount) * 100 : 0}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{templateStats.premium} CV</p>
                        </div>
                    </div>

                    {/* Ratio CV/Utilisateur */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">CV par utilisateur</p>
                                <p className="text-2xl font-bold text-white">
                                    {stats.usersCount > 0 ? (stats.cvsCount / stats.usersCount).toFixed(1) : 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Panier moyen</p>
                                <p className="text-2xl font-bold text-white">
                                    {stats.paymentsThisMonth && stats.paymentsThisMonth > 0
                                        ? formatCurrency(stats.revenue / stats.paymentsThisMonth)
                                        : formatCurrency(0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activité récente */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Activité récente</h3>
                                <p className="text-xs text-slate-400">Dernières actions sur la plateforme</p>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-white/10 max-h-96 overflow-y-auto">
                        {/* Nouveaux utilisateurs */}
                        {stats.recentUsers && stats.recentUsers.length > 0 && (
                            <>
                                <div className="px-6 py-3 bg-slate-900/80">
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Nouveaux utilisateurs</p>
                                </div>
                                {stats.recentUsers.slice(0, 3).map((user) => (
                                    <div key={user._id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                                <UserCheck className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">{user.fullName}</p>
                                                <p className="text-xs text-slate-400">{user.email}</p>
                                            </div>
                                            <div className="text-xs text-slate-500">
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
                                <div className="px-6 py-3 bg-slate-900/80">
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Nouveaux CV</p>
                                </div>
                                {stats.recentCVs.slice(0, 3).map((cv) => (
                                    <div key={cv._id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
                                                <FileCheck className="w-5 h-5 text-fuchsia-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">{cv.fullName}</p>
                                                <p className="text-xs text-slate-400">{cv.title}</p>
                                            </div>
                                            <div className="text-xs text-slate-500">
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
                                    <p className="text-sm text-slate-500">Aucune activité récente</p>
                                </div>
                            )}
                    </div>
                </div>
            </div>

            {/* Export Section */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="font-semibold text-white">Exporter les rapports</h3>
                        <p className="text-sm text-slate-400">Téléchargez les statistiques au format CSV</p>
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
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
                    >
                        <Download className="w-4 h-4" />
                        Exporter CSV
                    </button>
                </div>
            </div>
        </div>
    );
}