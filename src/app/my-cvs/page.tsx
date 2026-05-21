"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Plus,
  Edit,
  Eye,
  Download,
  CreditCard,
  Trash2,
  Search,
  RefreshCw,
} from "lucide-react";
import { Header } from "@/components/header";

type CVItem = {
  _id: string;
  fullName: string;
  title: string;
  template: string;
  updatedAt: string;
  isPaid: boolean;
  isExpired?: boolean;
};

export default function MyCvsPage() {
  const [cvs, setCvs] = useState<CVItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCVs();
  }, []);

  async function fetchCVs() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cv");
      const payload = await response.json();
      setCvs(payload.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des CVs:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteCV(id: string) {
    if (!confirm("Supprimer ce CV ?")) return;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/cv/${id}`, { method: "DELETE" });
      if (response.ok) setCvs((prev) => prev.filter((cv) => cv._id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  const filteredCvs = useMemo(() => {
    if (!searchTerm.trim()) return cvs;
    const q = searchTerm.toLowerCase();
    return cvs.filter(
      (cv) =>
        cv.fullName?.toLowerCase().includes(q) ||
        cv.title?.toLowerCase().includes(q),
    );
  }, [cvs, searchTerm]);

  const stats = useMemo(
    () => ({
      total: cvs.length,
      paid: cvs.filter((c) => c.isPaid).length,
      unpaid: cvs.filter((c) => !c.isPaid).length,
    }),
    [cvs],
  );

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50/30">
      <div className="w-full bg-white">
        <Header />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes CV</h1>
            <p className="text-gray-600 mt-1">Gérez et téléchargez vos CV</p>
          </div>
          <Link
            href="/templates"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-white font-semibold hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Nouveau CV
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
          <aside className="space-y-3">
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="text-xs text-gray-500">Payés</p>
              <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="text-xs text-gray-500">À payer</p>
              <p className="text-2xl font-bold text-amber-600">{stats.unpaid}</p>
            </div>
          </aside>

          <section className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <button
                type="button"
                onClick={fetchCVs}
                className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
                title="Rafraîchir"
              >
                <RefreshCw className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-gray-500">Chargement...</div>
            ) : filteredCvs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">Aucun CV trouvé</p>
                <Link
                  href="/templates"
                  className="inline-block mt-4 text-blue-600 font-medium hover:underline"
                >
                  Créer un CV
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {filteredCvs.map((cv) => (
                  <li
                    key={cv._id}
                    className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-gray-900 truncate">
                          {cv.fullName || "Sans nom"}
                        </h2>
                        <p className="text-sm text-gray-500 truncate">
                          {cv.title || "Sans titre"} · {cv.template}
                        </p>
                        <span
                          className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                            cv.isPaid
                              ? "bg-green-100 text-green-700"
                              : cv.isExpired
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {cv.isPaid
                            ? "Téléchargeable"
                            : cv.isExpired
                              ? "Expiré"
                              : "Paiement requis"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/cv?cvId=${cv._id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Modifier
                        </Link>
                        <Link
                          href={`/preview?cvId=${cv._id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Aperçu
                        </Link>
                        {!cv.isPaid && !cv.isExpired && (
                          <Link
                            href={`/cv?cvId=${cv._id}&step=6&export=1`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-sm text-white font-medium"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Payer
                          </Link>
                        )}
                        {cv.isPaid && (
                          <a
                            href={`/api/cv/${cv._id}/pdf`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white font-medium"
                          >
                            <Download className="w-3.5 h-3.5" />
                            PDF
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteCV(cv._id)}
                          disabled={deletingId === cv._id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
