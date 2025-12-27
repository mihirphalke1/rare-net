import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Shield, 
  Database, 
  Lock,
  Globe,
  Search,
  Upload,
  CheckCircle2
} from 'lucide-react';
import { Logo, LogoWithText } from '../components/Logo';

export function LandingPage() {
  const stats = [
    { value: '300+', label: 'Patient Records' },
    { value: '8', label: 'Hospital Nodes' },
    { value: '15', label: 'Rare Diseases' },
  ];

  const features = [
    {
      icon: Shield,
      title: 'K-Anonymity Protection',
      description: 'Requires ≥5 matching cases before returning results. Blocks queries for ultra-rare conditions that could identify patients.',
    },
    {
      icon: Database,
      title: 'CyborgDB Encryption',
      description: 'Patient symptom vectors encrypted in-use with institution-specific keys. No cross-hospital data exposure.',
    },
    {
      icon: Lock,
      title: 'Differential Privacy',
      description: 'Laplace noise (ε=0.1) added to confidence scores. Prevents reverse-engineering exact patient counts.',
    },
  ];

  const hospitals = [
    { name: 'Mumbai', flag: '🇮🇳', region: 'Asia' },
    { name: 'Tokyo', flag: '🇯🇵', region: 'Asia' },
    { name: 'Singapore', flag: '🇸🇬', region: 'Asia' },
    { name: 'Boston', flag: '🇺🇸', region: 'Americas' },
    { name: 'Toronto', flag: '🇨🇦', region: 'Americas' },
    { name: 'São Paulo', flag: '🇧🇷', region: 'Americas' },
    { name: 'London', flag: '🇬🇧', region: 'Europe' },
    { name: 'Berlin', flag: '🇩🇪', region: 'Europe' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Navigation - Centered Glass Style */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="bg-white/60 backdrop-blur-2xl border border-white/40 rounded-2xl px-8 py-3.5 flex items-center justify-between shadow-lg shadow-slate-900/5">
            <Link to="/" className="flex items-center gap-2.5">
              <Logo size={32} />
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                RareNet
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                Features
              </a>
              <a href="#network" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                Network
              </a>
              <Link to="/how-it-works" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                How It Works
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-32 w-80 h-80 bg-sky-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-20 -right-32 w-80 h-80 bg-teal-100 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-slate-600">
              Powered by CyborgDB Encrypted Vector Search
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6"
          >
            Collaborative Diagnosis
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-600">
              Without Borders
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto mb-10"
          >
            Two-tier privacy architecture that enables hospitals to collaboratively
            diagnose rare diseases without sharing patient data. 94% privacy risk
            reduction with k-anonymity and differential privacy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              to="/login"
              className="group px-8 py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 transition-all shadow-xl shadow-sky-500/25 flex items-center gap-3"
            >
              <Search className="w-5 h-5" />
              <span>Search Network</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/login"
              className="px-8 py-4 rounded-2xl text-lg font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              <span>Contribute Case</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 max-w-xl mx-auto"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm"
              >
                <div className="text-2xl sm:text-3xl font-bold text-sky-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Two-Tier Privacy Architecture
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              CyborgDB encryption protects each hospital's data, while our privacy
              aggregator layer prevents information leakage through k-anonymity and
              differential privacy.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-100 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>

                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Network Section */}
      <section id="network" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Cross-Institutional Collaboration
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              8 hospital nodes with encrypted patient databases. Queries run
              across all institutions simultaneously, returning only aggregated
              diagnostic insights—never raw patient data.
            </p>
          </motion.div>

          {/* Network Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative mb-12"
          >
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                {/* Central Hub */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center shadow-xl shadow-sky-500/30 z-10">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                
                {/* Orbiting indicator */}
                <div className="absolute -inset-8 rounded-full border-2 border-dashed border-slate-200 animate-spin" style={{ animationDuration: '30s' }} />
                <div className="absolute -inset-16 rounded-full border border-slate-100" />
              </div>
            </div>
          </motion.div>

          {/* Hospital Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {hospitals.map((hospital, idx) => (
              <motion.div
                key={hospital.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100 hover:border-sky-200 transition-all"
              >
                <span className="text-2xl">{hospital.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{hospital.name}</p>
                  <p className="text-xs text-slate-400">{hospital.region}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
            Stop the Diagnostic Odyssey
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join the network and access collaborative rare disease diagnosis
            without compromising patient privacy. Average diagnosis time: days, not years.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 transition-all shadow-xl shadow-sky-500/25"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-100">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <LogoWithText size={24} />
          <p className="text-sm text-slate-500">
            Privacy-Preserving Healthcare AI
          </p>
        </div>
      </footer>
    </div>
  );
}
