import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth, getAuthHeader } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { HospitalCasesPage } from './pages/HospitalCasesPage';
// HospitalsPage removed - users can only view their own hospital
import { SearchConsole } from './components/SearchConsole';
import { DiagnosticInsight } from './components/DiagnosticInsight';
import { NetworkStatus } from './components/NetworkStatus';
import { ContributorMode } from './components/ContributorMode';
import { MyCases } from './components/MyCases';
import { PrivacyVisualizer } from './components/PrivacyVisualizer';
import {
  Shield,
  Search,
  Upload,
  LogOut,
  User,
  Building2,
  Loader2,
  Database,
  Activity,
  Zap
} from 'lucide-react';
import { Logo } from './components/Logo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

// Types
interface InsightData {
  suggested_diagnosis: string;
  confidence_score: number;
  recommended_tests: string[];
  specialist_referral: string;
  privacy_status: string;
  privacy_message?: string;
  icd10_code?: string;
  prevalence?: string;
  description?: string;
}

interface AuditData {
  vectors_scanned: number;
  institutions_queried: number;
  raw_matches_found: number;
  privacy_threshold: number;
  threshold_passed: boolean;
  noise_epsilon: number;
  data_returned: string;
  diagnosis_distribution?: Record<string, number>;
}

interface DiagnoseResponse {
  insight: InsightData;
  audit: AuditData;
  query: string;
  search_time_ms: number;
}

type TabType = 'diagnose' | 'contribute' | 'my-cases';

// Header Component
function AppHeader({ activeTab }: { activeTab: TabType }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [networkStatus, setNetworkStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_URL}/api/health`);
        setNetworkStatus(res.ok ? 'online' : 'offline');
      } catch {
        setNetworkStatus('offline');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white/60 backdrop-blur-2xl border border-white/40 rounded-2xl px-6 py-3 shadow-lg shadow-slate-900/5 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/search" className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0">
            <Logo size={32} />
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              RareNet
            </span>
          </Link>

          {/* Tabs */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-full p-1">
            <button
              onClick={() => navigate('/search')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${activeTab === 'diagnose'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            <button
              onClick={() => navigate('/my-cases')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'my-cases'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <Database className="w-4 h-4" />
              <span>My Cases</span>
            </button>
            <button
              onClick={() => navigate('/contribute')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'contribute'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <Upload className="w-4 h-4" />
              <span>Contribute</span>
            </button>
          </div>

          {/* Right side - Network + User */}
          <div className="flex items-center gap-3 shrink-0">
            <NetworkStatus status={networkStatus} />

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">{user?.email?.split('@')[0]}</span>
              {user?.hospital && (
                <>
                  <span className="text-slate-200">|</span>
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span className="text-sm text-slate-500 capitalize">{user.hospital}</span>
                </>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// Mobile Tab Bar Component
function MobileTabBar({ activeTab }: { activeTab: TabType }) {
  const navigate = useNavigate();
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-4 py-3">
      <div className="flex items-center bg-slate-100 rounded-full p-1">
        <button
          onClick={() => navigate('/search')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'diagnose'
            ? 'bg-white text-sky-600 shadow-sm'
            : 'text-slate-500'
            }`}
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </button>
        <button
          onClick={() => navigate('/my-cases')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'my-cases'
            ? 'bg-white text-sky-600 shadow-sm'
            : 'text-slate-500'
            }`}
        >
          <Database className="w-4 h-4" />
          <span>Cases</span>
        </button>
        <button
          onClick={() => navigate('/contribute')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'contribute'
            ? 'bg-white text-sky-600 shadow-sm'
            : 'text-slate-500'
            }`}
        >
          <Upload className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
}


// Network Stats Type
interface NetworkStats {
  total_cases: number;
  hospital_count: number;
  your_hospital: string | null;
  your_hospital_cases: number;
  diseases_tracked: number;
  symptoms_indexed: number;
}

// Search Page Content
function SearchPage() {
  const { token } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [searchStep, setSearchStep] = useState<string>('');
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [privacyMetrics, setPrivacyMetrics] = useState<any>(null);

  // Fetch network stats
  useEffect(() => {
    if (!token) {
      console.log('⏳ Waiting for token...');
      return; // Wait for token to be available
    }

    console.log('🔄 Fetching network stats with token:', token?.substring(0, 20) + '...');

    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/stats`, {
          headers: getAuthHeader(token)
        });
        console.log('📊 Stats response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Network stats loaded:', data);
          setNetworkStats(data);
        } else {
          const errorText = await response.text();
          console.error('❌ Stats fetch failed:', response.status, errorText);
        }
      } catch (err) {
        console.error('❌ Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, [token]);

  // Fetch privacy metrics
  useEffect(() => {
    if (!token) return; // Wait for token to be available

    const fetchPrivacyMetrics = async () => {
      try {
        const response = await fetch(`${API_URL}/api/privacy/metrics`, {
          headers: getAuthHeader(token)
        });
        if (response.ok) {
          const data = await response.json();
          setPrivacyMetrics(data);
        }
      } catch (err) {
        console.error('Failed to fetch privacy metrics:', err);
      }
    };
    fetchPrivacyMetrics();
    // Refresh every 10 seconds
    const interval = setInterval(fetchPrivacyMetrics, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setInsight(null);
    setAudit(null);
    setCurrentQuery(query);

    try {
      const steps = [
        'Encoding symptoms...',
        'Querying encrypted nodes...',
        'Applying privacy filters...',
        'Aggregating results...'
      ];

      for (const step of steps) {
        setSearchStep(step);
        await new Promise(r => setTimeout(r, 150));
      }

      const response = await fetch(`${API_URL}/api/diagnose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(token)
        },
        body: JSON.stringify({ symptoms: query, top_k: 20 }),
      });

      if (!response.ok) throw new Error('Request failed');

      const data: DiagnoseResponse = await response.json();
      setInsight(data.insight);
      setAudit(data.audit);
      setSearchTime(data.search_time_ms);

    } catch (error) {
      console.error('Error:', error);
      setInsight({
        suggested_diagnosis: 'Connection Error',
        confidence_score: 0,
        recommended_tests: [],
        specialist_referral: '',
        privacy_status: 'ERROR',
        privacy_message: 'Failed to connect to the diagnostic network.'
      });
    } finally {
      setIsSearching(false);
      setSearchStep('');
    }
  };

  // Example queries for quick search
  const exampleQueries = [
    { label: 'Ehlers-Danlos ✅', query: 'joint hypermobility, easy bruising, stretchy skin', type: 'success' },
    { label: 'Kawasaki ✅', query: 'high fever, strawberry tongue, rash, conjunctivitis', type: 'success' },
    { label: 'Ghost Case 🛑', query: 'stiffness in trunk muscles, exaggerated startle response, episodic spasms, hyperlordosis', type: 'blocked' },
  ];

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Search the Network
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto mb-8">
          Enter symptoms to find matching diagnoses across encrypted hospital databases.
        </p>

        <div className="max-w-2xl mx-auto">
          <SearchConsole
            onSearch={handleSearch}
            isSearching={isSearching}
          />
        </div>

        {/* Search Status */}
        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
                <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
                <span className="text-sm text-slate-600">{searchStep}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Results OR Default Content */}
      <AnimatePresence mode="wait">
        {(insight || isSearching) ? (
          <motion.section
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2">
              <DiagnosticInsight
                insight={insight}
                audit={audit}
                searchTime={searchTime}
                isLoading={isSearching}
                query={currentQuery}
              />
            </div>

            {audit && !isSearching && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-sky-600" />
                  <h3 className="font-semibold text-slate-900">Privacy Summary</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-500">Vectors Scanned</span>
                    <span className="text-sm font-medium text-slate-900">{audit.vectors_scanned}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-500">Hospitals Queried</span>
                    <span className="text-sm font-medium text-slate-900">{audit.institutions_queried}</span>
                  </div>

                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mt-4 ${audit.threshold_passed
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                    }`}>
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Privacy: {audit.threshold_passed ? 'Verified' : 'Protected'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.section>
        ) : (
          <motion.section
            key="default"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Quick Search Examples */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-slate-900">Quick Search Examples</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Click any example below to try a pre-configured search:
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {exampleQueries.map((example) => (
                  <button
                    key={example.label}
                    onClick={() => handleSearch(example.query)}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-sky-50 hover:border-sky-200 transition-all text-left group"
                  >
                    <div className="font-medium text-slate-900 group-hover:text-sky-700 mb-1">
                      {example.label}
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-2">
                      {example.query}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Network Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-5 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white"
              >
                <Database className="w-6 h-6 mb-2 opacity-80" />
                <div className="text-3xl font-bold">
                  {networkStats?.total_cases ?? '-'}
                </div>
                <div className="text-sm opacity-80">Total Network Cases</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm"
              >
                <Building2 className="w-6 h-6 mb-2 text-slate-400" />
                <div className="text-3xl font-bold text-slate-900">
                  {networkStats?.hospital_count ?? '-'}
                </div>
                <div className="text-sm text-slate-500">Connected Hospitals</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm"
              >
                <Activity className="w-6 h-6 mb-2 text-slate-400" />
                <div className="text-3xl font-bold text-slate-900">
                  {networkStats?.diseases_tracked ?? '-'}
                </div>
                <div className="text-sm text-slate-500">Diseases Tracked</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm"
              >
                <Shield className="w-6 h-6 mb-2 text-emerald-500" />
                <div className="text-3xl font-bold text-emerald-600">100%</div>
                <div className="text-sm text-slate-500">Privacy Protected</div>
              </motion.div>
            </div>

            {/* Privacy Protection Visualizer */}
            {privacyMetrics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <PrivacyVisualizer metrics={privacyMetrics} />
              </motion.div>
            )}

            {/* Privacy Notice */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-slate-900">Privacy-Preserving Network</h3>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <p>
                  RareNet queries <strong>{networkStats?.hospital_count || 8} hospital nodes</strong> globally,
                  but you will only receive:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">&#10003;</span>
                    <span>Aggregated diagnosis suggestions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">&#10003;</span>
                    <span>Confidence scores (with privacy noise)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">&#10003;</span>
                    <span>Recommended tests and specialists</span>
                  </li>
                </ul>
                <p className="text-slate-400 text-xs mt-3">
                  You will never see which hospital has matching cases or individual patient data.
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

// Main App Layout (authenticated)
function MainLayout() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('diagnose');

  // Set initial tab based on route
  useEffect(() => {
    if (location.pathname === '/search') {
      setActiveTab('diagnose');
    } else if (location.pathname === '/my-cases') {
      setActiveTab('my-cases');
    } else if (location.pathname === '/contribute') {
      setActiveTab('contribute');
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-20 sm:pb-0">
      <AppHeader activeTab={activeTab} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'diagnose' && (
            <motion.div
              key="diagnose"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <SearchPage />
            </motion.div>
          )}
          {activeTab === 'my-cases' && (
            <motion.div
              key="my-cases"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MyCases />
            </motion.div>
          )}
          {activeTab === 'contribute' && (
            <motion.div
              key="contribute"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ContributorMode />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MobileTabBar activeTab={activeTab} />
    </div>
  );
}

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Logo size={48} className="mx-auto mb-4" />
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// App Router
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contribute"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-cases"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hospital/:hospitalId"
        element={
          <ProtectedRoute>
            <HospitalCasesPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Root App
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
