"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Filter,
  Trash2,
  Edit,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";

type User = {
  _id: string;
  emailOrPhone: string;
  fullName?: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
  cvsCount?: number;
};

const adminHeaders = { "x-user-role": "admin" };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users", { headers: adminHeaders });
      if (!response.ok) return;
      const payload = await response.json();
      setUsers(payload.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function removeUser(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      await load();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setDeletingId(null);
      setShowConfirmModal(null);
    }
  }

  async function toggleUserStatus(id: string, currentStatus: boolean) {
    try {
      await fetch(`/api/admin/users/${id}/status`, {
        method: "PATCH",
        headers: { ...adminHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      await load();
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.emailOrPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(user =>
        statusFilter === "active" ? user.isActive !== false : user.isActive === false
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return { label: "Administrateur", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Shield };
    }
    return { label: "Utilisateur", color: "bg-blue-100 text-blue-700 border-blue-200", icon: UserCheck };
  };

  const getStatusBadge = (isActive: boolean = true) => {
    if (isActive) {
      return { label: "Actif", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle };
    }
    return { label: "Inactif", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle };
  };

  const formatDate = (date?: string) => {
    if (!date) return "Jamais";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getContactType = (contact: string) => {
    if (contact.includes("@")) return { type: "email", icon: Mail };
    return { type: "phone", icon: Phone };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Gestion des utilisateurs
        </h1>
        <p className="text-gray-600 mt-2">Gérez les comptes utilisateurs de la plateforme</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Administrateurs</p>
              <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === "admin").length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Utilisateurs actifs</p>
              <p className="text-2xl font-bold text-green-600">{users.filter(u => u.isActive !== false).length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
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
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="user">Utilisateurs</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
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

      {/* Users Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des utilisateurs...</p>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
          <p className="text-gray-500">
            {searchTerm || roleFilter !== "all" || statusFilter !== "all"
              ? "Aucun utilisateur ne correspond à vos critères"
              : "Aucun utilisateur n'est encore inscrit"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Utilisateur</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rôle</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Inscrit le</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const RoleBadge = getRoleBadge(user.role);
                  const StatusBadge = getStatusBadge(user.isActive);
                  const ContactIcon = getContactType(user.emailOrPhone).icon;

                  return (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.emailOrPhone.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.fullName || "Nom non défini"}</p>
                            {user.cvsCount !== undefined && (
                              <p className="text-xs text-gray-500">{user.cvsCount} CV créés</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ContactIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{user.emailOrPhone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${RoleBadge.color}`}>
                          <RoleBadge.icon className="w-3 h-3" />
                          {RoleBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${StatusBadge.color}`}>
                          <StatusBadge.icon className="w-3 h-3" />
                          {StatusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleUserStatus(user._id, user.isActive !== false)}
                            className={`p-2 rounded-lg transition-all ${user.isActive !== false
                                ? "text-red-600 hover:bg-red-50"
                                : "text-green-600 hover:bg-green-50"
                              }`}
                            title={user.isActive !== false ? "Désactiver" : "Activer"}
                          >
                            {user.isActive !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setShowConfirmModal(user._id)}
                            disabled={deletingId === user._id}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                            title="Supprimer"
                          >
                            {deletingId === user._id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
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
              Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ?
              Toutes ses données seront perdues.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => removeUser(showConfirmModal)}
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