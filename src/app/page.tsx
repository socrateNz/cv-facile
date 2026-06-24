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
  Sparkles
} from "lucide-react";
import { Header } from "@/components/header";
import { getSiteSettings } from "@/lib/settings";

export default async function Home() {
  const settings = await getSiteSettings();
  
  const features = [
    {
      icon: Save,
      title: "Sauvegarde en temps réel",
      description: "Vos données sont sauvegardées instantanément sur notre cloud sécurisé MongoDB.",
      glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]",
      iconColor: "text-blue-400",
    },
    {
      icon: LayoutTemplate,
      title: "Templates Premium",
      description: "Des modèles professionnels testés par des recruteurs (Moderne, Classique, Premium).",
      glow: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]",
      iconColor: "text-violet-400",
    },
    {
      icon: ImageIcon,
      title: "Photo Pro",
      description: "Ajoutez et recadrez votre photo avec notre intégration Cloudinary ultra-rapide.",
      glow: "group-hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]",
      iconColor: "text-pink-400",
    },
    {
      icon: CreditCard,
      title: `Mobile Money (${settings?.payment.paymentAmount} ${settings?.payment.currency})`,
      description: "Paiement ultra-simple via MTN ou Orange Money, sans inscription obligatoire.",
      glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
      iconColor: "text-emerald-400",
    },
    {
      icon: FileCheck,
      title: "Export PDF Pixel-Perfect",
      description: "Ce que vous voyez à l'écran est exactement ce qui sera imprimé. Aucune surprise.",
      glow: "group-hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]",
      iconColor: "text-orange-400",
    },
    {
      icon: Zap,
      title: "Gain de temps maximal",
      description: "Remplissez vos informations une fois, changez de modèle en un clic.",
      glow: "group-hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]",
      iconColor: "text-yellow-400",
    },
  ];

  const stats = [
    { value: "1 000+", label: "CV créés" },
    { value: "98%", label: "Taux de satisfaction" },
    { value: "5 min", label: "Temps moyen de création" },
    { value: "24/7", label: "Disponibilité" },
  ];

  const steps = [
    { step: "01", title: "Remplissez", desc: "Vos expériences et formations" },
    { step: "02", title: "Choisissez", desc: "Un modèle de CV professionnel" },
    { step: "03", title: "Prévisualisez", desc: "Le rendu final en temps réel" },
    { step: "04", title: "Téléchargez", desc: `Payez ${settings?.payment.paymentAmount} ${settings?.payment.currency} et recevez votre PDF` },
  ];

  const avatarInitials = ["AB", "CK", "DM", "EF"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans antialiased overflow-hidden selection:bg-indigo-500/30">
      
      {/* ── BACKGROUND ANIMATIONS ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* ── NAVIGATION ── */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* ── HERO ── */}
      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-6 pt-32 pb-24 grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-200">La nouvelle norme du recrutement</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-white">
              Démarquez-vous avec un CV{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                remarquable
              </span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-xl">
              Créez un CV professionnel, élégant et optimisé pour décrocher des entretiens. 
              Générez votre PDF parfait pour seulement{" "}
              <span className="font-semibold text-white">{settings?.payment.paymentAmount} {settings?.payment.currency}</span> via Mobile Money.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                href="/templates"
                className="group relative inline-flex items-center gap-2 bg-white text-slate-950 font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                <FileText className="w-5 h-5 transition-transform group-hover:rotate-12" />
                Créer mon CV
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Trust row */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {avatarInitials.map((initials, i) => (
                  <div
                    key={initials}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-slate-950 flex items-center justify-center text-xs font-bold text-white shadow-lg"
                    style={{ zIndex: 10 - i }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-400">
                <span className="font-semibold text-white">+1 000 candidats</span> nous font confiance
              </p>
            </div>
          </div>

          {/* Right — Glassmorphic feature cards */}
          <div className="flex flex-col gap-4 perspective-1000">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl transform transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:border-indigo-500/30">
              <div className="flex items-start gap-5">
                <div className="bg-indigo-500/20 rounded-xl p-3 shadow-inner shadow-indigo-500/20 shrink-0">
                  <Smartphone className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">Paiement Mobile Money</h3>
                  <p className="text-sm text-slate-400 mb-3">Intégration directe et sécurisée avec NotchPay.</p>
                  <div className="flex gap-2">
                    <span className="text-[11px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full">MTN</span>
                    <span className="text-[11px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full">Orange</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl transform transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:border-blue-500/30 lg:ml-8">
              <div className="flex items-start gap-5">
                <div className="bg-blue-500/20 rounded-xl p-3 shadow-inner shadow-blue-500/20 shrink-0">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">Protection des données</h3>
                  <p className="text-sm text-slate-400">Vos données personnelles sont cryptées et stockées en toute sécurité.</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl transform transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:border-emerald-500/30">
              <div className="flex items-start gap-5">
                <div className="bg-emerald-500/20 rounded-xl p-3 shadow-inner shadow-emerald-500/20 shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">Génération Instantanée</h3>
                  <p className="text-sm text-slate-400">Aperçu en temps réel et export PDF natif sans perte de qualité.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="relative z-10 border-y border-white/5 bg-slate-900/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-110">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-slate-400 mt-2 tracking-wide uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="relative z-10 py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
                Un processus fluide
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                De la première lettre tapée au téléchargement du PDF final, chaque étape est optimisée pour vous.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {steps.map((item, idx) => (
                <div key={item.step} className="relative group">
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 h-full transition-all duration-300 group-hover:bg-white/10 group-hover:border-indigo-500/50 group-hover:-translate-y-2 group-hover:shadow-[0_10px_40px_rgba(99,102,241,0.2)]">
                    <div className="text-5xl font-black text-white/5 mb-6 group-hover:text-indigo-500/20 transition-colors duration-300">
                      {item.step}
                    </div>
                    <h3 className="font-bold text-white text-xl mb-3">{item.title}</h3>
                    <p className="text-slate-400">{item.desc}</p>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 text-slate-600 text-2xl -translate-y-1/2 font-light">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="relative z-10 py-32 bg-slate-900/50 border-y border-white/5">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
                Outils de pointe
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Découvrez toutes les fonctionnalités qui feront briller votre candidature.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className={`group bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 ${feature.glow}`}
                >
                  <div className="inline-flex bg-white/5 rounded-xl p-4 mb-6 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-white text-xl mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING / CTA ── */}
        <section id="pricing" className="relative z-10 py-32">
          <div className="mx-auto max-w-5xl px-6">
            <div className="relative rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-fuchsia-600 p-1 md:p-1 overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.4)]">
              {/* Inner glass effect */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
              
              <div className="relative bg-slate-950/40 backdrop-blur-3xl rounded-[2.4rem] p-12 md:p-20 text-center">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white drop-shadow-lg">
                  Prêt à transformer votre carrière ?
                </h2>
                <p className="text-indigo-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light">
                  Rejoignez des milliers de professionnels qui ont boosté leurs opportunités grâce à {settings?.general.siteName}.
                </p>
                <Link
                  href="/templates"
                  className="group inline-flex items-center gap-3 bg-white text-slate-950 font-bold px-10 py-5 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                >
                  <span className="text-lg">Commencer gratuitement</span>
                  <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                </Link>
                <p className="mt-6 text-sm text-indigo-200/80 uppercase tracking-widest font-semibold">
                  Paiement à l'export • Support 24/7
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white tracking-tight">{settings?.general.siteName}</span>
              </div>
              <p className="text-slate-400 leading-relaxed pr-4">
                {settings?.general.siteDescription}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Navigation</h4>
              <ul className="space-y-4 text-slate-400">
                <li><Link href="/templates" className="hover:text-indigo-400 transition-colors">Créer mon CV</Link></li>
                <li><a href="#how-it-works" className="hover:text-indigo-400 transition-colors">Comment ça marche</a></li>
                <li><a href="#features" className="hover:text-indigo-400 transition-colors">Fonctionnalités</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Support</h4>
              <ul className="space-y-4 text-slate-400">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Mentions légales</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Paiements</h4>
              <div className="flex gap-3">
                <span className="bg-white/5 border border-white/10 text-slate-300 font-semibold px-4 py-2 rounded-xl text-sm">MTN</span>
                <span className="bg-white/5 border border-white/10 text-slate-300 font-semibold px-4 py-2 rounded-xl text-sm">Orange</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500">
              © {new Date().getFullYear()} {settings?.general.siteName} — Tous droits réservés.
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <a href="#" className="hover:text-indigo-400 transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">CGV</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
