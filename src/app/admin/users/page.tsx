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
      return { label: "Administrateur", color: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20", icon: Shield };
    }
    return { label: "Utilisateur", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", icon: UserCheck };
  };

  const getStatusBadge = (isActive: boolean = true) => {
    if (isActive) {
      return { label: "Actif", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle };
    }
    return { label: "Inactif", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle };
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

  const getContactType = (contact?: string) => {
    if (contact && contact.includes("@")) return { type: "email", icon: Mail };
    return { type: "phone", icon: Phone };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
          Gestion des utilisateurs
        </h1>
        <p className="text-slate-400 mt-2">Gérez les comptes utilisateurs de la plateforme</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total utilisateurs</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Administrateurs</p>
              <p className="text-2xl font-bold text-fuchsia-400">{users.filter(u => u.role === "admin").length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-fuchsia-400" />
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Utilisateurs actifs</p>
              <p className="text-2xl font-bold text-emerald-400">{users.filter(u => u.isActive !== false).length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-emerald-400" />
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
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/50 border border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-4 py-2 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="user">Utilisateurs</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>

            <button
              onClick={load}
              className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-all"
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
            <div className="w-16 h-16 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500">Chargement des utilisateurs...</p>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-slate-900/50 rounded-2xl shadow-lg border border-white/10 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Aucun utilisateur trouvé</h3>
          <p className="text-slate-400">
            {searchTerm || roleFilter !== "all" || statusFilter !== "all"
              ? "Aucun utilisateur ne correspond à vos critères"
              : "Aucun utilisateur n'est encore inscrit"}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/80 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Utilisateur</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Rôle</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Inscrit le</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((user) => {
                  const RoleBadge = getRoleBadge(user.role);
                  const StatusBadge = getStatusBadge(user.isActive);
                  const ContactIcon = getContactType(user.emailOrPhone).icon;

                  return (
                    <tr key={user._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-600 flex items-center justify-center text-white font-semibold shadow-md">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : (user.emailOrPhone ? user.emailOrPhone.charAt(0).toUpperCase() : "?")}
                          </div>
                          <div>
                            <p className="font-medium text-white">{user.fullName || "Nom non défini"}</p>
                            {user.cvsCount !== undefined && (
                              <p className="text-xs text-slate-400">{user.cvsCount} CV créés</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ContactIcon className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-300">{user.emailOrPhone}</span>
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
                        <div className="flex items-center gap-1.5 text-sm text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleUserStatus(user._id, user.isActive !== false)}
                            className={`p-2 rounded-lg transition-all ${user.isActive !== false
                                ? "text-red-400 hover:bg-white/5"
                                : "text-emerald-400 hover:bg-white/5"
                              }`}
                            title={user.isActive !== false ? "Désactiver" : "Activer"}
                          >
                            {user.isActive !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setShowConfirmModal(user._id)}
                            disabled={deletingId === user._id}
                            className="p-2 rounded-lg text-red-400 hover:bg-white/5 transition-all disabled:opacity-50"
                            title="Supprimer"
                          >
                            {deletingId === user._id ? (
                              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Confirmer la suppression</h3>
                <p className="text-sm text-slate-400">Cette action est irréversible</p>
              </div>
            </div>
            <p className="text-slate-300 mb-6">
              Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ?
              Toutes ses données seront perdues.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => removeUser(showConfirmModal)}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 font-bold border border-red-500/20 hover:bg-red-500/30 transition-colors"
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