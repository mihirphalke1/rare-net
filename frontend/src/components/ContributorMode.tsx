import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, getAuthHeader } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Upload,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Database,
  Building2,
  Stethoscope,
  FileText,
  Lock,
  TrendingUp,
  Radio,
  ChevronRight
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

interface NetworkStats {
  total_cases: number;
  hospital_count: number;
  your_hospital: string | null;
  your_hospital_cases: number;
  cases_by_hospital: Record<string, number>;
  contributions_today: number;
}

interface Disease {
  name: string;
  icd10: string;
  prevalence: string;
}

export function ContributorMode() {
  const { user, token } = useAuth();
  
  // Form state
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [ageRange, setAgeRange] = useState<string>('19-40');
  const [sex, setSex] = useState<string>('M');
  const [notes, setNotes] = useState('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ caseId: string; stats: NetworkStats } | null>(null);
  
  // Data state
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [stats, setStats] = useState<NetworkStats | null>(null);

  // Load diseases once
  useEffect(() => {
    const loadDiseases = async () => {
      try {
        const res = await fetch(`${API_URL}/api/diseases`);
        if (res.ok) {
          const data = await res.json();
          setDiseases(data.diseases);
        }
      } catch (err) {
        console.error('Failed to load diseases:', err);
      }
    };
    loadDiseases();
  }, []);

  // Real-time stats polling (every 5 seconds)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/stats`, { headers: getAuthHeader(token) });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      }
    };
    
    // Initial fetch
    fetchStats();
    
    // Poll every 5 seconds for real-time updates
    const interval = setInterval(fetchStats, 5000);
    
    return () => clearInterval(interval);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(token)
        },
        body: JSON.stringify({
          symptoms,
          diagnosis,
          patient_age_range: ageRange,
          patient_sex: sex,
          notes: notes || null
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to submit case');
      }

      const data = await response.json();
      setSuccess({
        caseId: data.case_id,
        stats: data.network_stats
      });
      
      // Update local stats
      setStats(prev => prev ? {
        ...prev,
        total_cases: data.network_stats.total_cases,
        cases_by_hospital: {
          ...prev.cases_by_hospital,
          [user?.hospital || '']: data.network_stats.your_hospital_cases
        }
      } : null);

      // Reset form
      setSymptoms('');
      setDiagnosis('');
      setNotes('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200">
              <Upload className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Contribute New Case</h2>
              <p className="text-sm text-slate-500">
                Securely upload a confirmed diagnosis to your hospital's encrypted database
              </p>
            </div>
          </div>
          
          {/* Hospital Badge */}
          {user?.hospital && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sm text-sky-700">
              <Building2 className="w-4 h-4" />
              <span>Uploading to: <strong>{user.hospital.charAt(0).toUpperCase() + user.hospital.slice(1)} Hospital</strong></span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-6">
          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Symptom Description</span>
              </div>
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe the patient's symptoms in detail (e.g., joint hypermobility, stretchy skin, easy bruising, chronic fatigue)"
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all resize-none"
              required
              minLength={10}
            />
            <p className="mt-1 text-xs text-slate-400">
              Minimum 10 characters. Include all relevant clinical observations.
            </p>
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-slate-400" />
                <span>Diagnosis</span>
              </div>
            </label>
            <select
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
              required
            >
              <option value="">Select a diagnosis...</option>
              <option value="Unknown" className="text-amber-600 font-medium">
                Unknown / Not Yet Diagnosed
              </option>
              <optgroup label="Confirmed Diagnoses">
                {diseases.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.icd10})
                  </option>
                ))}
              </optgroup>
            </select>
            {diagnosis === 'Unknown' && (
              <p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                This case will be added to the network for symptom matching. 
                If a diagnosis is later confirmed, you can submit a new case with the confirmed diagnosis.
              </p>
            )}
          </div>

          {/* Demographics Row */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Patient Age Range
              </label>
              <select
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
              >
                <option value="0-18">0-18 years</option>
                <option value="19-40">19-40 years</option>
                <option value="41-60">41-60 years</option>
                <option value="60+">60+ years</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Patient Sex
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional clinical observations..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all resize-none"
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-xl bg-emerald-50 border border-emerald-200"
              >
                <div className="flex items-center gap-2 text-emerald-700 mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Case Uploaded Successfully!</span>
                </div>
                <p className="text-sm text-emerald-600">
                  Case ID: <code className="bg-emerald-100 px-1.5 py-0.5 rounded">{success.caseId}</code>
                </p>
                <p className="text-xs text-emerald-500 mt-2">
                  Network now has {success.stats.total_cases} total cases
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !symptoms || !diagnosis}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Encrypting & Uploading...</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                <span>Encrypt & Upload to Network</span>
              </>
            )}
          </button>

          {/* Privacy Note */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Privacy Note:</strong> This case will be encrypted and stored in your hospital's CyborgDB index. 
              Only aggregated, privacy-preserving results will be returned in cross-institution queries.
            </p>
          </div>
        </form>
      </div>

      {/* Sidebar - Stats */}
      <div className="space-y-6">
        {/* Network Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-sky-600" />
              <h3 className="font-semibold text-slate-800">Network Statistics</h3>
            </div>
            {/* Real-time indicator */}
            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Live</span>
            </div>
          </div>

          {stats ? (
            <div className="space-y-4">
              {/* Total Cases */}
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200">
                <motion.div 
                  key={stats.total_cases}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold text-sky-600"
                >
                  {stats.total_cases}
                </motion.div>
                <div className="text-sm text-slate-500">Total Cases in Network</div>
              </div>

              {/* Your Hospital */}
              {user?.hospital && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Your Hospital</p>
                  <Link 
                    to={`/hospital/${user.hospital}`}
                    className="flex justify-between items-center p-3 rounded-xl bg-sky-50 border border-sky-200 hover:border-sky-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-sky-600" />
                      <span className="text-sm font-medium text-slate-700 capitalize">{user.hospital.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-sky-600">
                        {stats.your_hospital_cases || 0}
                      </span>
                      <ChevronRight className="w-4 h-4 text-sky-400" />
                    </div>
                  </Link>
                  <p className="text-xs text-slate-400 mt-2">
                    You can only view cases from your own hospital.
                  </p>
                </div>
              )}

              {/* Network Total (aggregated only) */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Network Total</p>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>{stats.hospital_count || 8} hospitals connected</span>
                </div>
              </div>

              {/* Today's Contributions - Real-time animated */}
              <motion.div 
                key={stats.contributions_today}
                initial={{ scale: 1.02, backgroundColor: 'rgb(209 250 229)' }}
                animate={{ scale: 1, backgroundColor: 'rgb(236 253 245)' }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between p-3 rounded-lg border border-emerald-200"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700">Today's Contributions</span>
                </div>
                <motion.span 
                  key={stats.contributions_today}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-bold text-emerald-600"
                >
                  {stats.contributions_today}
                </motion.span>
              </motion.div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-800">Encryption Process</h3>
          </div>

          <div className="space-y-3 text-sm">
            {[
              { step: '1', title: 'Vectorize', desc: 'Symptoms → 384-dim vector' },
              { step: '2', title: 'Encrypt', desc: 'Vector encrypted by CyborgDB' },
              { step: '3', title: 'Store', desc: 'Saved to hospital index' },
              { step: '4', title: 'Update', desc: 'Stats counter incremented' },
            ].map((item) => (
              <div key={item.step} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-emerald-600">{item.step}</span>
                </div>
                <div>
                  <p className="font-medium text-slate-700">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

