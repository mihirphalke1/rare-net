import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Logo, LogoWithText } from '../components/Logo';

// Custom SVG Components
function SymptomInputSVG() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-auto">
      <defs>
        <linearGradient id="inputGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      
      {/* Browser window - centered */}
      <rect x="30" y="20" width="180" height="140" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="2"/>
      <rect x="30" y="20" width="180" height="28" rx="10" fill="#f1f5f9"/>
      <circle cx="50" cy="34" r="5" fill="#fca5a5"/>
      <circle cx="66" cy="34" r="5" fill="#fcd34d"/>
      <circle cx="82" cy="34" r="5" fill="#86efac"/>
      
      {/* Search bar */}
      <rect x="48" y="62" width="144" height="32" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5"/>
      <circle cx="66" cy="78" r="7" fill="none" stroke="url(#inputGrad)" strokeWidth="2"/>
      <line x1="71" y1="83" x2="76" y2="88" stroke="url(#inputGrad)" strokeWidth="2" strokeLinecap="round"/>
      
      {/* Typing text animation */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
      >
        <text x="86" y="82" fontSize="11" fill="#64748b" fontFamily="system-ui">joint pain, fatigue...</text>
      </motion.g>
      
      {/* Cursor blink */}
      <motion.rect
        x="172" y="70" width="2" height="16" fill="#0ea5e9"
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
      />
      
      {/* Symptom chips - evenly spaced */}
      <rect x="48" y="110" width="56" height="22" rx="11" fill="#e0f2fe"/>
      <text x="76" y="125" fontSize="9" fill="#0284c7" textAnchor="middle" fontFamily="system-ui">symptom</text>
      <rect x="112" y="110" width="40" height="22" rx="11" fill="#e0f2fe"/>
      <text x="132" y="125" fontSize="9" fill="#0284c7" textAnchor="middle" fontFamily="system-ui">pain</text>
      <rect x="160" y="110" width="32" height="22" rx="11" fill="#ccfbf1"/>
      <text x="176" y="125" fontSize="9" fill="#0d9488" textAnchor="middle" fontFamily="system-ui">+2</text>
    </svg>
  );
}

function VectorEncodingSVG() {
  return (
    <svg viewBox="0 0 260 180" className="w-full h-auto">
      <defs>
        <linearGradient id="vecGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      
      {/* Text input box */}
      <rect x="20" y="55" width="70" height="50" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5"/>
      <text x="30" y="76" fontSize="10" fill="#64748b" fontFamily="system-ui">symptoms</text>
      <text x="30" y="92" fontSize="10" fill="#94a3b8" fontFamily="system-ui">text...</text>
      
      {/* Arrow */}
      <motion.path
        d="M98 80 L118 80"
        stroke="url(#vecGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      <polygon points="118,75 128,80 118,85" fill="url(#vecGrad)"/>
      
      {/* Neural network - centered */}
      <g transform="translate(138, 40)">
        {/* Input layer */}
        {[0, 25, 50].map((y, i) => (
          <motion.circle
            key={`in-${i}`}
            cx="0" cy={y + 20} r="8"
            fill="url(#vecGrad)"
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
          />
        ))}
        
        {/* Hidden layer */}
        {[0, 20, 40, 60].map((y, i) => (
          <motion.circle
            key={`hid-${i}`}
            cx="40" cy={y + 10} r="6"
            fill="#94a3b8"
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.1, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.15 }}
          />
        ))}
        
        {/* Output layer */}
        {[0, 14, 28, 42, 56].map((y, i) => (
          <motion.circle
            key={`out-${i}`}
            cx="80" cy={y + 12} r="5"
            fill="url(#vecGrad)"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
          />
        ))}
        
        {/* Connections */}
        <g stroke="#cbd5e1" strokeWidth="0.75" opacity="0.4">
          {[0, 25, 50].map((y1, i) =>
            [0, 20, 40, 60].map((y2, j) => (
              <line key={`l1-${i}-${j}`} x1="8" y1={y1 + 20} x2="34" y2={y2 + 10}/>
            ))
          )}
          {[0, 20, 40, 60].map((y1, i) =>
            [0, 14, 28, 42, 56].map((y2, j) => (
              <line key={`l2-${i}-${j}`} x1="46" y1={y1 + 10} x2="75" y2={y2 + 12}/>
            ))
          )}
        </g>
      </g>
      
      {/* Label */}
      <rect x="85" y="148" width="90" height="24" rx="12" fill="#f0fdfa" stroke="#99f6e4" strokeWidth="1"/>
      <text x="130" y="164" fontSize="10" fill="#0d9488" textAnchor="middle" fontFamily="system-ui" fontWeight="500">384-dim vector</text>
    </svg>
  );
}

function EncryptedSearchSVG() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-auto">
      <defs>
        <linearGradient id="dbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Central query - perfectly centered */}
      <motion.circle
        cx="120" cy="90" r="24"
        fill="url(#dbGrad)"
        filter="url(#glow)"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      <text x="120" y="95" fontSize="12" fill="white" textAnchor="middle" fontFamily="system-ui" fontWeight="600">Q</text>
      
      {/* Database nodes - evenly positioned */}
      {[
        { x: 50, y: 45, label: 'MUM' },
        { x: 190, y: 45, label: 'BOS' },
        { x: 50, y: 135, label: 'LON' },
        { x: 190, y: 135, label: 'TYO' },
      ].map((node, i) => (
        <g key={i}>
          <motion.line
            x1="120" y1="90" x2={node.x} y2={node.y}
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeDasharray="6 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.25 }}
          />
          <motion.circle
            cx={node.x} cy={node.y} r="26"
            fill="white"
            stroke="url(#dbGrad)"
            strokeWidth="2"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
          />
          <text x={node.x} y={node.y + 4} fontSize="10" textAnchor="middle" fill="#334155" fontFamily="system-ui" fontWeight="500">{node.label}</text>
        </g>
      ))}
      
      {/* Lock icons on each node */}
      {[
        { x: 50, y: 45 },
        { x: 190, y: 45 },
        { x: 50, y: 135 },
        { x: 190, y: 135 },
      ].map((pos, i) => (
        <g key={`lock-${i}`} transform={`translate(${pos.x + 16}, ${pos.y - 22})`}>
          <rect x="0" y="6" width="12" height="10" rx="2" fill="url(#dbGrad)"/>
          <rect x="2" y="2" width="8" height="6" rx="4" fill="none" stroke="url(#dbGrad)" strokeWidth="1.5"/>
        </g>
      ))}
    </svg>
  );
}

function AggregationSVG() {
  return (
    <svg viewBox="0 0 260 200" className="w-full h-auto">
      <defs>
        <linearGradient id="aggGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id="funnelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f0f9ff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>
      
      {/* Input result cards - evenly spaced */}
      {[35, 80, 125, 170].map((x, i) => (
        <motion.g key={i}
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.2 }}
        >
          <rect x={x} y="16" width="44" height="52" rx="6" fill="white" stroke="#e2e8f0" strokeWidth="1.5"/>
          <rect x={x + 8} y="26" width="28" height="4" rx="2" fill="#cbd5e1"/>
          <rect x={x + 8} y="36" width="22" height="4" rx="2" fill="#e2e8f0"/>
          <rect x={x + 8} y="46" width="25" height="4" rx="2" fill="#e2e8f0"/>
          <circle cx={x + 22} cy="58" r="5" fill="url(#aggGrad)" opacity="0.4"/>
        </motion.g>
      ))}
      
      {/* Funnel - better positioned */}
      <motion.path
        d="M35 78 L224 78 L180 110 L80 110 Z"
        fill="url(#funnelGrad)"
        stroke="url(#aggGrad)"
        strokeWidth="2"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      
      {/* Funnel tube */}
      <rect x="105" y="110" width="50" height="20" fill="url(#funnelGrad)" stroke="url(#aggGrad)" strokeWidth="2"/>
      
      {/* Arrow down */}
      <motion.g
        animate={{ y: [0, 4, 0] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
      >
        <line x1="130" y1="135" x2="130" y2="155" stroke="url(#aggGrad)" strokeWidth="3" strokeLinecap="round"/>
        <polygon points="120,152 130,166 140,152" fill="url(#aggGrad)"/>
      </motion.g>
      
      {/* Result badge */}
      <motion.g
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <rect x="80" y="172" width="100" height="22" rx="11" fill="url(#aggGrad)"/>
        <text x="130" y="187" fontSize="10" fill="white" textAnchor="middle" fontFamily="system-ui" fontWeight="600">Diagnosis Result</text>
      </motion.g>
    </svg>
  );
}

export function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      title: 'Enter Symptoms',
      description: 'Clinicians enter patient symptoms in natural language. Our interface validates input against known medical terminology.',
      illustration: <SymptomInputSVG />,
    },
    {
      number: 2,
      title: 'Vector Encoding',
      description: 'Symptoms are transformed into a 384-dimensional semantic vector using machine learning, capturing medical meaning.',
      illustration: <VectorEncodingSVG />,
    },
    {
      number: 3,
      title: 'Encrypted Search',
      description: 'The vector queries all hospital databases simultaneously. CyborgDB performs similarity search on encrypted data.',
      illustration: <EncryptedSearchSVG />,
    },
    {
      number: 4,
      title: 'Aggregate & Return',
      description: 'Results are aggregated across institutions. Only the diagnosis name and confidence score are returned—never patient details.',
      illustration: <AggregationSVG />,
    },
  ];

  const guarantees = [
    {
      title: 'Patient IDs Protected',
      description: 'Individual patient identifiers never leave hospital databases.',
      positive: true,
    },
    {
      title: 'Hospital Sources Hidden',
      description: 'You never learn which hospital a match came from.',
      positive: true,
    },
    {
      title: 'Small Cohorts Blocked',
      description: 'Results are blocked if fewer than 5 cases match globally.',
      positive: true,
    },
    {
      title: 'No Raw Data Exposure',
      description: 'Patient records, symptoms, or demographics are never returned.',
      positive: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="bg-white/60 backdrop-blur-2xl border border-white/40 rounded-2xl px-8 py-3.5 flex items-center justify-between shadow-lg shadow-slate-900/5">
            <Link to="/" className="flex items-center gap-2.5" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Logo size={32} />
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                RareNet
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link to="/#features" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                Features
              </Link>
              <Link to="/#network" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                Network
              </Link>
              <span className="text-sm font-medium text-sky-600">
                How It Works
              </span>
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

      {/* Hero */}
      <section className="pt-36 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-6"
          >
            How RareNet Works
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            A privacy-preserving pipeline that enables cross-institutional diagnosis 
            while keeping patient data completely secure.
          </motion.p>
        </div>
      </section>

      {/* Z-Pattern Steps */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-24">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
            >
              {/* Text Content */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-sky-500/25">
                    {step.number}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {step.title}
                  </h2>
                </div>
                <p className="text-lg text-slate-600 leading-relaxed pl-16">
                  {step.description}
                </p>
              </div>

              {/* Illustration */}
              <div className="flex-1 w-full max-w-sm">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow">
                  {step.illustration}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Privacy Guarantees */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
              Privacy Guarantees
            </h2>
            <p className="text-lg text-slate-600">
              What our system ensures at every step.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {guarantees.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-500/5 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.positive 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-red-50 text-red-500'
                  }`}>
                    {item.positive ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
                
                {/* Hover gradient line */}
                <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-sky-500 to-teal-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to try it?
          </h2>
          <p className="text-slate-600 mb-8">
            Sign in with demo credentials to explore the network.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 transition-all shadow-xl shadow-sky-500/25"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
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
