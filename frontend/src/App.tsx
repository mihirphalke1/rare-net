import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { WorldMap } from './components/WorldMap';
import { SearchConsole } from './components/SearchConsole';
import { ResultsGrid } from './components/ResultsGrid';
import { 
  ShieldCheck, 
  Database, 
  Lock, 
  Zap,
  Activity,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

interface SearchResult {
  id: string;
  score: number;
  metadata: {
    diagnosis: string;
    institution_id: string;
    patient_id: string;
  };
  source_institution: string;
  disease_info?: {
    icd10: string;
    prevalence: string;
    description: string;
    specialist: string;
    treatment: string[];
  };
}

const QUICK_SEARCHES = [
  { label: "TREX1 Symptoms", query: "chilblain lesions, raynaud phenomenon, joint pain, fatigue" },
  { label: "Kawasaki Signs", query: "high fever, strawberry tongue, rash, red eyes" },
  { label: "Gaucher Symptoms", query: "enlarged spleen, bone pain, anemia, fatigue" },
  { label: "Marfan Features", query: "tall stature, long fingers, lens dislocation, aortic dilation" },
  { label: "Pompe Disease", query: "muscle weakness, cardiomegaly, respiratory issues" },
];

function App() {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchStep, setSearchStep] = useState<string>('');
  const [searchTime, setSearchTime] = useState<number>(0);
  const [networkStatus, setNetworkStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    // Check backend health on mount
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_URL}/api/health`);
        if (response.ok) {
          setNetworkStatus('online');
        } else {
          setNetworkStatus('offline');
        }
      } catch {
        setNetworkStatus('offline');
      }
    };
    checkHealth();
  }, []);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setHasSearched(true);
    setResults([]);
    
    try {
      // Animate through search steps
      setSearchStep('Vectorizing symptom query...');
      await new Promise(r => setTimeout(r, 600));
      
      setSearchStep('Encrypting query via CyborgDB...');
      await new Promise(r => setTimeout(r, 600));
      
      setSearchStep('Broadcasting to network nodes...');
      await new Promise(r => setTimeout(r, 400));
      
      setSearchStep('Searching encrypted indices...');
      
      const response = await fetch(`${API_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: query, top_k: 8 }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
      setSearchTime(data.search_time_ms || 0);
      
      setSearchStep('Decrypting results...');
      await new Promise(r => setTimeout(r, 300));
      
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
      setSearchStep('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-animated grid-pattern text-white">
      <Navbar status={networkStatus} />
      
      {/* Hero Section */}
      <main className="relative pt-20">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            {/* Status Badge */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-cyan-500/20 mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full ${networkStatus === 'online' ? 'bg-cyan-400 animate-ping' : 'bg-yellow-400'} opacity-75`} />
                <span className={`relative inline-flex h-2 w-2 rounded-full ${networkStatus === 'online' ? 'bg-cyan-500' : 'bg-yellow-500'}`} />
              </span>
              <span className="text-sm text-gray-300 font-mono">
                {networkStatus === 'online' ? '3 NODES CONNECTED' : networkStatus === 'checking' ? 'CONNECTING...' : 'OFFLINE MODE'}
              </span>
              <span className="text-cyan-500">•</span>
              <span className="text-sm text-gray-400 font-mono">ENCRYPTION ACTIVE</span>
            </motion.div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white">Rare</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 glow-text">Net</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
              Privacy-preserving rare disease diagnosis across global medical institutions
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyan-500" />
                <span>Zero-Knowledge Search</span>
              </div>
              <div className="flex items-center gap-2">
                <Database size={16} className="text-cyan-500" />
                <span>CyborgDB Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-cyan-500" />
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </motion.div>

          {/* Search Console */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto mb-8"
          >
            <SearchConsole onSearch={handleSearch} isSearching={isSearching} />
            
            {/* Quick Search Pills */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-gray-500 mr-2">Quick search:</span>
              {QUICK_SEARCHES.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleSearch(item.query)}
                  disabled={isSearching}
                  className="px-3 py-1 text-xs rounded-full bg-white/5 border border-white/10 text-gray-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Search Status */}
            <AnimatePresence>
              {isSearching && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 flex items-center justify-center gap-3"
                >
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-cyan-500"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-2 h-2 rounded-full bg-cyan-500"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="w-2 h-2 rounded-full bg-cyan-500"
                    />
                  </div>
                  <span className="text-sm font-mono text-cyan-400">{searchStep}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Map & Info */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              {/* World Map */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Activity size={16} className="text-cyan-500" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Network Topology
                  </h2>
                </div>
                <WorldMap activeScan={isSearching} />
              </div>

              {/* Privacy Info Card */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <ShieldCheck size={18} className="text-cyan-400" />
                  </div>
                  <h3 className="font-semibold text-white">Privacy Guarantee</h3>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <Lock size={14} className="text-cyan-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-400">
                      <span className="text-white">Encrypted vectors</span> — Patient data converted to mathematical representations, encrypted before leaving institution
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Zap size={14} className="text-cyan-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-400">
                      <span className="text-white">Homomorphic search</span> — Similarity computed on encrypted data without decryption
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-400">
                      <span className="text-amber-400">Metadata visible</span> — Institution ID required for routing; no PII included
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              {hasSearched && searchTime > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={18} className="text-cyan-400" />
                    <h3 className="font-semibold text-white">Search Metrics</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-cyan-400">{searchTime.toFixed(0)}ms</p>
                      <p className="text-xs text-gray-500">Response Time</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{results.length}</p>
                      <p className="text-xs text-gray-500">Matches Found</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Right Column - Results */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database size={16} className="text-cyan-500" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    {hasSearched ? `Diagnostic Matches (${results.length})` : 'Awaiting Query'}
                  </h2>
                </div>
                {hasSearched && results.length > 0 && (
                  <span className="text-xs text-gray-500 font-mono">
                    Sorted by similarity score
                  </span>
                )}
              </div>

              {hasSearched ? (
                <ResultsGrid results={results} isLoading={isSearching} />
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card rounded-2xl p-12 text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
                    <Database size={28} className="text-cyan-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Ready to Search
                  </h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Enter patient symptoms above to search across encrypted databases from Mumbai, Boston, and London institutions.
                  </p>
                  <div className="text-xs text-gray-500 font-mono p-4 rounded-lg bg-black/30 inline-block">
                    Example: "chilblain lesions, joint pain, raynaud phenomenon"
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>RareNet — Privacy-Preserving Cross-Institutional Medical Research</p>
          <p className="mt-1 text-xs text-gray-600">
            Powered by CyborgDB • Built for Healthcare Hackathon 2024
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
