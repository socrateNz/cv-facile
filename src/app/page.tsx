import Link from "next/link";
import {
  FileText,
  CreditCard,
  Save,
  LayoutTemplate,
  ImageIcon,
  FileCheck,
  Smartphone,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Header } from "@/components/header";

export default function Home() {
  const features = [
    {
      icon: Save,
      title: "Sauvegarde automatique",
      description: "Vos données sont sauvegardées en temps réel sur MongoDB",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: LayoutTemplate,
      title: "3 Templates pro",
      description: "Choix entre design moderne, classique ou premium",
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      icon: ImageIcon,
      title: "Upload photo Cloudinary",
      description: "Ajoutez votre photo professionnelle facilement",
      bg: "bg-pink-50",
      iconColor: "text-pink-600",
    },
    {
      icon: CreditCard,
      title: "Mobile Money 500 FCFA",
      description: "MTN ou Orange Money — sans compte obligatoire",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: FileCheck,
      title: "PDF professionnel",
      description: "Export PDF après paiement, identique à l'aperçu",
      bg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      icon: Zap,
      title: "Gain de temps",
      description: "Créez votre CV en moins de 5 minutes",
      bg: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
  ];

  const stats = [
    { value: "1 000+", label: "CV créés" },
    { value: "98%", label: "Satisfaction" },
    { value: "5 min", label: "Temps moyen" },
    { value: "24/7", label: "Support" },
  ];

  const steps = [
    { step: "01", title: "Remplissez", desc: "Vos informations professionnelles" },
    { step: "02", title: "Choisissez", desc: "Votre template préféré" },
    { step: "03", title: "Prévisualisez", desc: "Vérifiez le rendu en direct" },
    { step: "04", title: "Payez & téléchargez", desc: "500 FCFA — PDF professionnel" },
  ];

  const avatarInitials = ["AB", "CK", "DM", "EF"];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">

      {/* ── NAVIGATION ── */}
      <Header />

      {/* ── HERO ── */}
      <main>
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 grid md:grid-cols-2 gap-14 items-center">

          {/* Left */}
          <div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
              Créez un CV pro en{" "}
              <span className="text-indigo-600">quelques minutes</span>
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
              Formulaire simple, aperçu en temps réel, export PDF premium et paiement Mobile Money à seulement{" "}
              <span className="font-semibold text-indigo-600">500 FCFA</span>.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Link
                href="/templates"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-200"
              >
                <FileText className="w-4 h-4" />
                Commencer mon CV
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust row */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {avatarInitials.map((initials) => (
                  <div
                    key={initials}
                    className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-200 to-indigo-300 border-2 border-white flex items-center justify-center text-[10px] font-semibold text-indigo-700"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-800">+1 000 utilisateurs</span> nous font confiance
              </p>
            </div>
          </div>

          {/* Right — feature cards */}
          <div className="flex flex-col gap-3">
            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
              <div className="flex items-start gap-4">
                <div className="bg-white rounded-xl p-2.5 shadow-sm shrink-0">
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Paiement Mobile Money</h3>
                  <p className="text-sm text-gray-500 mb-2">MTN Mobile Money &amp; Orange Money acceptés</p>
                  <div className="flex gap-1.5">
                    <span className="text-[11px] font-medium bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">MTN</span>
                    <span className="text-[11px] font-medium bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">Orange</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 rounded-xl p-2.5 shrink-0">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Sécurité garantie</h3>
                  <p className="text-sm text-gray-500">Paiement sécurisé avec NotchPay</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 rounded-xl p-2.5 shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Aperçu en temps réel</h3>
                  <p className="text-sm text-gray-500">Visualisez votre CV à chaque modification</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="border-y border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-6xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-indigo-600">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Tout ce qu&apos;il vous faut
            </h2>
            <p className="text-gray-500 text-lg">
              Des fonctionnalités pensées pour votre réussite professionnelle
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`inline-flex ${feature.bg} rounded-xl p-3 mb-4`}>
                  <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="bg-gray-50 border-y border-gray-100 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                Comment ça marche ?
              </h2>
              <p className="text-gray-500 text-lg">Un processus simple en 4 étapes</p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
              {steps.map((item, idx) => (
                <div key={item.step} className="relative text-center">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold mb-4 shadow-lg shadow-indigo-200">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-[calc(50%+2rem)] text-gray-300 text-xl">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING / CTA ── */}
        <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
          <div className="bg-indigo-600 rounded-3xl p-10 md:p-16 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Prêt à décrocher votre prochain poste ?
            </h2>
            <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
              Rejoignez plus de 1 000 professionnels qui ont boosté leur carrière avec CVFacile
            </p>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-8 py-4 rounded-xl hover:bg-indigo-50 active:scale-95 transition-all shadow-xl"
            >
              Créer mon CV maintenant
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="mt-4 text-sm text-indigo-300">
              Sans engagement · Paiement sécurisé · Support 24/7
            </p>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 bg-white py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">CVFacile</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Créez votre CV professionnel facilement et rapidement.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-4">Liens utiles</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><Link href="/templates" className="hover:text-indigo-600 transition-colors">Créer mon CV</Link></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Modèles</a></li>
                <li><a href="#pricing" className="hover:text-indigo-600 transition-colors">Tarifs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-4">Support</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Mentions légales</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-4">Paiement accepté</h4>
              <div className="flex gap-2">
                <span className="bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-lg">MTN</span>
                <span className="bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-lg">Orange</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 text-center text-sm text-gray-400">
            © 2024 CVFacile — Tous droits réservés
          </div>
        </div>
      </footer>
    </div>
  );
}
