import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, getAuthHeader } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import {
  Building2,
  ArrowLeft,
  Database,
  Shield,
  Lock,
  Loader2,
  AlertCircle,
  Activity,
  User,
  LogOut
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

interface HospitalData {
  hospital_id: string;
  hospital_name: string;
  total_cases: number;
  cases_by_disease: Record<string, number>;
  is_own_hospital: boolean;
  can_view_details: boolean;
  privacy_note: string;
}

export function HospitalCasesPage() {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [data, setData] = useState<HospitalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!hospitalId) return;
      
      // Privacy check: Only allow viewing your own hospital
      if (user && hospitalId !== user.hospital && user.role !== 'admin') {
        setError('Access denied. You can only view your own hospital\'s cases.');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_URL}/api/hospital/${hospitalId}/cases`, {
          headers: getAuthHeader(token)
        });
        
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || 'Failed to fetch hospital data');
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [hospitalId, token, user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get disease color based on index
  const getDiseaseColor = (index: number) => {
    const colors = [
      'from-sky-500 to-cyan-500',
      'from-emerald-500 to-teal-500',
      'from-violet-500 to-purple-500',
      'from-amber-500 to-orange-500',
      'from-rose-500 to-pink-500',
      'from-blue-500 to-indigo-500',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="bg-white/60 backdrop-blur-2xl border border-white/40 rounded-2xl px-6 py-3 shadow-lg shadow-slate-900/5 flex items-center justify-between">
            <Link to="/search" className="flex items-center gap-3">
              <Logo size={32} />
              <span className="text-lg font-bold text-slate-900 tracking-tight">RareNet</span>
            </Link>

            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{user.email?.split('@')[0]}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link 
          to="/search"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Network</span>
        </Link>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-500">Loading hospital data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center"
          >
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Data</h2>
            <p className="text-red-600">{error}</p>
          </motion.div>
        )}

        {/* Hospital Data */}
        {data && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Hospital Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-100 border border-sky-200">
                    <Building2 className="w-8 h-8 text-sky-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">{data.hospital_name}</h1>
                    <p className="text-slate-500">Node ID: {data.hospital_id}</p>
                  </div>
                </div>
                
                {data.is_own_hospital && (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                    Your Hospital
                  </span>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Total Cases</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{data.total_cases}</div>
                </div>
                
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Diseases</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {Object.keys(data.cases_by_disease).length}
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Privacy</span>
                  </div>
                  <div className="text-lg font-semibold text-emerald-600">Protected</div>
                </div>
              </div>
            </div>

            {/* Disease Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Cases by Disease</h2>
              
              {Object.keys(data.cases_by_disease).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(data.cases_by_disease)
                    .sort((a, b) => b[1] - a[1])
                    .map(([disease, count], index) => {
                      const percentage = (count / data.total_cases) * 100;
                      return (
                        <div key={disease} className="group">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-700 truncate max-w-[70%]">{disease}</span>
                            <span className="text-sm font-medium text-slate-900">{count} cases</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              className={`h-full rounded-full bg-gradient-to-r ${getDiseaseColor(index)}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">No cases recorded yet</p>
              )}
            </div>

            {/* Privacy Notice */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <Lock className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">{data.privacy_note}</p>
                {!data.can_view_details && (
                  <p className="text-xs text-slate-400 mt-1">
                    You can only view detailed case information for your own hospital.
                  </p>
                )}
              </div>
            </div>

          </motion.div>
        )}
      </main>
    </div>
  );
}

