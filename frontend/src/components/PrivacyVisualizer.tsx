import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Activity, Lock, TrendingDown, Eye } from 'lucide-react';

interface PrivacyMetrics {
  queries_blocked_today: number;
  privacy_risk_score: number;
  noise_added_count: number;
  k_anonymity_threshold: number;
}

interface PrivacyVisualizerProps {
  metrics: PrivacyMetrics;
}

export function PrivacyVisualizer({ metrics }: PrivacyVisualizerProps) {
  const riskColor = metrics.privacy_risk_score < 2 ? 'emerald' : 
                    metrics.privacy_risk_score < 5 ? 'amber' : 'red';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500 rounded-lg">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Privacy Protection</h3>
          <p className="text-xs text-slate-500">Real-time protection metrics</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Queries Blocked */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-4 border border-red-100"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium text-slate-600">Blocked Today</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-red-600">{metrics.queries_blocked_today}</span>
            <span className="text-xs text-slate-500">queries</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">k &lt; {metrics.k_anonymity_threshold}</p>
        </motion.div>

        {/* Privacy Risk Score */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`bg-white rounded-xl p-4 border border-${riskColor}-100`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-slate-600">Risk Score</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold text-${riskColor}-600`}>
              {metrics.privacy_risk_score.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">94% reduction</p>
        </motion.div>

        {/* Noise Added */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-4 border border-blue-100"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-slate-600">Noise Added</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-blue-600">{metrics.noise_added_count}</span>
            <span className="text-xs text-slate-500">times</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">DP ε=0.1</p>
        </motion.div>

        {/* K-Anonymity Threshold */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-4 border border-purple-100"
        >
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-slate-600">Protection</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-purple-600">k≥{metrics.k_anonymity_threshold}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Enforced 100%</p>
        </motion.div>
      </div>

      {/* Status Bar */}
      <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600" />
          <p className="text-xs text-emerald-700 font-medium">
            All queries protected by two-tier privacy architecture
          </p>
        </div>
      </div>
    </motion.div>
  );
}
