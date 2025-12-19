import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth, getAuthHeader } from '../context/AuthContext';
import {
  Database,
  Building2,
  Shield,
  Loader2,
  AlertCircle,
  Activity,
  Lock,
  FileText,
  TrendingUp
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

interface HospitalData {
  hospital_id: string;
  hospital_name: string;
  total_cases: number;
  cases_by_disease: Record<string, number>;
  is_own_hospital: boolean;
  privacy_note: string;
}

export function MyCases() {
  const { user, token } = useAuth();
  const [data, setData] = useState<HospitalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.hospital) {
        setError('No hospital assigned to your account');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/hospital/${user.hospital}/cases`, {
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
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user?.hospital, token]);

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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          My Hospital's Cases
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          View aggregated case statistics for your hospital. Individual patient records are never displayed.
        </p>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading your hospital data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto p-6 rounded-2xl bg-red-50 border border-red-200 text-center"
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
          className="grid lg:grid-cols-3 gap-6"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hospital Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-100 border border-sky-200">
                  <Building2 className="w-8 h-8 text-sky-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900">{data.hospital_name}</h2>
                  <p className="text-slate-500">Node ID: {data.hospital_id}</p>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Your Hospital</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200 text-center">
                  <Database className="w-5 h-5 text-sky-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-sky-600">{data.total_cases}</div>
                  <div className="text-xs text-slate-500">Total Cases</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <Activity className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-slate-900">
                    {Object.keys(data.cases_by_disease).length}
                  </div>
                  <div className="text-xs text-slate-500">Diseases</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-emerald-600">Active</div>
                  <div className="text-xs text-slate-500">Status</div>
                </div>
              </div>
            </div>

            {/* Disease Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-slate-400" />
                <h3 className="font-semibold text-slate-900">Cases by Disease</h3>
              </div>

              {Object.keys(data.cases_by_disease).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(data.cases_by_disease)
                    .sort((a, b) => b[1] - a[1])
                    .map(([disease, count], index) => {
                      const percentage = data.total_cases > 0 ? (count / data.total_cases) * 100 : 0;
                      return (
                        <div key={disease}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-slate-700 truncate max-w-[70%]">{disease}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">{count}</span>
                              <span className="text-xs text-slate-400">({percentage.toFixed(0)}%)</span>
                            </div>
                          </div>
                          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.6, delay: index * 0.1 }}
                              className={`h-full rounded-full bg-gradient-to-r ${getDiseaseColor(index)}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Database className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p>No cases recorded yet</p>
                  <p className="text-sm text-slate-400">Start contributing cases to see them here</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Privacy Notice */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-slate-900">Privacy Protected</h3>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <p>{data.privacy_note}</p>
                
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">&#10003;</span>
                    <span>Only aggregated statistics shown</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">&#10003;</span>
                    <span>No patient identifiers displayed</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">&#10003;</span>
                    <span>You can only view your own hospital</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl border border-sky-200 p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-sky-600" />
                <h3 className="font-semibold text-slate-900">Cross-Network Queries</h3>
              </div>
              <p className="text-sm text-slate-600">
                When you search the network, results come from <strong>all 8 hospitals</strong> globally, 
                but you only see aggregated diagnoses—never which hospital has matching cases.
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

