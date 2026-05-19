"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  LayoutTemplate,
  Download,
  Filter
} from "lucide-react";

type CVItem = {
  _id: string;
  fullName: string;
  title: string;
  email?: string;
  template?: string;
  isPublished: boolean;
  isPaid?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: {
    _id: string;
    fullName: string;
    emailOrPhone: string;
  };
};

const adminHeaders = { "x-user-role": "admin" };

export default function AdminCvsPage() {
  const [cvs, setCvs] = useState<CVItem[]>([]);
  const [filteredCvs, setFilteredCvs] = useState<CVItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "unpublished">("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [actionId, setActionId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/cvs", { headers: adminHeaders });
      if (!response.ok) return;
      const payload = await response.json();
      setCvs(payload.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function togglePublishStatus(id: string, currentStatus: boolean) {
    setActionId(id);
    try {
      await fetch(`/api/admin/cvs/${id}`, {
        method: "PATCH",
        headers: { ...adminHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });
      await load();
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
    } finally {
      setActionId(null);
    }
  }

  async function deleteCV(id: string) {
    setActionId(id);
    try {
      await fetch(`/api/admin/cvs/${id}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      await load();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setActionId(null);
      setShowConfirmModal(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let filtered = cvs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(cv =>
        cv.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cv.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(cv =>
        statusFilter === "published" ? cv.isPublished : !cv.isPublished
      );
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter(cv =>
        paymentFilter === "paid" ? cv.isPaid : !cv.isPaid
      );
    }

    setFilteredCvs(filtered);
  }, [searchTerm, statusFilter, paymentFilter, cvs]);

  const getStatusBadge = (isPublished: boolean) => {
    if (isPublished) {
      return { label: "Publié", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle };
    }
    return { label: "Désactivé", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle };
  };

  const getPaymentBadge = (isPaid: boolean = false) => {
    if (isPaid) {
      return { label: "Payé", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle };
    }
    return { label: "Non payé", color: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertCircle };
  };

  const getTemplateBadge = (template?: string) => {
    const templates: Record<string, { label: string; color: string }> = {
      modern: { label: "Modern", color: "bg-blue-100 text-blue-700 border-blue-200" },
      classic: { label: "Classic", color: "bg-gray-100 text-gray-700 border-gray-200" },
      compact: { label: "Premium", color: "bg-purple-100 text-purple-700 border-purple-200" },
      premium: { label: "Premium", color: "bg-purple-100 text-purple-700 border-purple-200" }
    };

    // Valeur par défaut si le template n'est pas reconnu
    const defaultTemplate = { label: "Standard", color: "bg-gray-100 text-gray-700 border-gray-200" };
    return templates[template || "modern"] || defaultTemplate;
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Gestion des CV
        </h1>
        <p className="text-gray-600 mt-2">Administrez les CV créés sur la plateforme</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total CV</p>
              <p className="text-2xl font-bold text-gray-900">{cvs.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Publiés</p>
              <p className="text-2xl font-bold text-green-600">{cvs.filter(cv => cv.isPublished).length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Désactivés</p>
              <p className="text-2xl font-bold text-red-600">{cvs.filter(cv => !cv.isPublished).length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Payés</p>
              <p className="text-2xl font-bold text-amber-600">{cvs.filter(cv => cv.isPaid).length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Download className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, titre ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="all">Tous les statuts</option>
              <option value="published">Publiés</option>
              <option value="unpublished">Désactivés</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="all">Tous les paiements</option>
              <option value="paid">Payés</option>
              <option value="unpaid">Non payés</option>
            </select>

            <button
              onClick={load}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
              title="Rafraîchir"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* CV Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des CV...</p>
          </div>
        </div>
      ) : filteredCvs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun CV trouvé</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== "all" || paymentFilter !== "all"
              ? "Aucun CV ne correspond à vos critères"
              : "Aucun CV n'a encore été créé"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">CV</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Propriétaire</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Template</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Paiement</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Créé le</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCvs.map((cv) => {
                  const StatusBadge = getStatusBadge(cv.isPublished);
                  const PaymentBadge = getPaymentBadge(cv.isPaid);
                  const TemplateBadge = getTemplateBadge(cv.template);

                  return (
                    <tr key={cv._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{cv.fullName || "Sans nom"}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{cv.title || "Sans titre"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {cv.userId?.fullName || cv.email || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${TemplateBadge.color}`}>
                          <LayoutTemplate className="w-3 h-3" />
                          {TemplateBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${StatusBadge.color}`}>
                          <StatusBadge.icon className="w-3 h-3" />
                          {StatusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${PaymentBadge.color}`}>
                          <PaymentBadge.icon className="w-3 h-3" />
                          {PaymentBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(cv.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/preview?cvId=${cv._id}`}
                            target="_blank"
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                            title="Voir l'aperçu"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => togglePublishStatus(cv._id, cv.isPublished)}
                            disabled={actionId === cv._id}
                            className={`p-2 rounded-lg transition-all ${cv.isPublished
                                ? "text-red-600 hover:bg-red-50"
                                : "text-green-600 hover:bg-green-50"
                              } disabled:opacity-50`}
                            title={cv.isPublished ? "Désactiver" : "Activer"}
                          >
                            {actionId === cv._id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : cv.isPublished ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setShowConfirmModal(cv._id)}
                            disabled={actionId === cv._id}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Confirm Delete Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmer la suppression</h3>
                <p className="text-sm text-gray-500">Cette action est irréversible</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer définitivement ce CV ?
              Toutes les données associées seront perdues.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => deleteCV(showConfirmModal)}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}