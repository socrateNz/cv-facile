"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Download,
  Eye
} from "lucide-react";
import Link from "next/link";

type Payment = {
  _id: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "canceled";
  reference: string;
  createdAt?: string;
  customer?: string;
  cvId?: string;
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending" | "failed" | "canceled">("all");

  async function load() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/payments");
      if (!response.ok) return;
      const payload = await response.json();
      setPayments(payload.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let filtered = payments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customer?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  }, [searchTerm, statusFilter, payments]);

  async function syncPayments() {
    setIsSyncing(true);
    setSyncResult(null);
    setSyncError(null);
    try {
      const response = await fetch("/api/admin/payments/sync", { method: "POST" });
      const payload = await response.json();
      if (response.ok) {
        setSyncResult(payload.message || "Synchronisation terminée avec succès.");
      } else {
        setSyncError(payload.message || "Erreur lors de la synchronisation.");
      }
      await load();
    } catch (error) {
      setSyncError("Erreur de connexion au serveur.");
    } finally {
      setIsSyncing(false);
    }
  }

  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === "completed").length,
    pending: payments.filter(p => p.status === "pending").length,
    failed: payments.filter(p => p.status === "failed" || p.status === "canceled").length,
    totalAmount: payments
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0)
  };

  const getStatusBadge = (status: Payment["status"]) => {
    const statusConfig = {
      completed: { label: "Payé", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle },
      pending: { label: "En attente", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock },
      failed: { label: "Échoué", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
      canceled: { label: "Annulé", color: "bg-slate-500/10 text-slate-400 border-white/10", icon: XCircle }
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + " FCFA";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
          Gestion des paiements
        </h1>
        <p className="text-slate-400 mt-2">Suivez et gérez les transactions NotchPay</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total transactions</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Paiements réussis</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.completed}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">En attente</p>
              <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Revenu total</p>
              <p className="text-2xl font-bold text-fuchsia-400">{formatAmount(stats.totalAmount)}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-fuchsia-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher par référence ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/50 border border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Payés</option>
              <option value="pending">En attente</option>
              <option value="failed">Échoués</option>
              <option value="canceled">Annulés</option>
            </select>

            <button
              onClick={syncPayments}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Synchronisation...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Sync NotchPay
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sync Results */}
      {syncResult && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <p className="text-sm text-emerald-300">{syncResult}</p>
          </div>
        </div>
      )}

      {syncError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-red-300">{syncError}</p>
          </div>
        </div>
      )}

      {/* Payments Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500">Chargement des paiements...</p>
          </div>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-slate-900/50 rounded-2xl shadow-lg border border-white/10 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Aucun paiement trouvé</h3>
          <p className="text-slate-400">
            {searchTerm || statusFilter !== "all"
              ? "Aucun paiement ne correspond à vos critères"
              : "Aucune transaction n'a encore été effectuée"}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/80 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Référence</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Client</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Montant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredPayments.map((payment) => {
                  const StatusBadge = getStatusBadge(payment.status);

                  return (
                    <tr key={payment._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <code className="text-xs font-mono bg-slate-950 px-2 py-1 rounded text-slate-300 border border-white/5">
                          {payment.reference}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                            {payment.customer ? payment.customer.charAt(0).toUpperCase() : "U"}
                          </div>
                          <span className="text-sm text-slate-300">
                            {payment.customer || "Client inconnu"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-white">
                          {formatAmount(payment.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${StatusBadge.color}`}>
                          <StatusBadge.icon className="w-3 h-3" />
                          {StatusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(payment.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {payment.cvId && (
                            <Link
                              href={`/preview?cvId=${payment.cvId}`}
                              target="_blank"
                              className="p-2 rounded-lg text-indigo-400 hover:bg-white/5 transition-all"
                              title="Voir le CV"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(payment.reference);
                              // Optionnel: ajouter un toast de notification
                            }}
                            className="p-2 rounded-lg text-slate-400 hover:bg-white/5 transition-all"
                            title="Copier la référence"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Section */}
      {payments.length > 0 && (
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-semibold text-white">Exporter les données</h3>
              <p className="text-sm text-slate-400">Téléchargez l'historique des transactions</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const csv = [
                    ["Référence", "Client", "Montant", "Statut", "Date"],
                    ...filteredPayments.map(p => [
                      p.reference,
                      p.customer || "N/A",
                      p.amount,
                      p.status,
                      p.createdAt || "N/A"
                    ])
                  ].map(row => row.join(",")).join("\n");

                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `paiements_${new Date().toISOString().split("T")[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-all"
              >
                <Download className="w-4 h-4" />
                Exporter CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}