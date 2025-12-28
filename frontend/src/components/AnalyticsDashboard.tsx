import { motion } from 'framer-motion';
import { TrendingUp, Activity, Shield, AlertTriangle, Download, BarChart3 } from 'lucide-react';

interface AnalyticsData {
  total_searches: number;
  searches_today: number;
  avg_confidence: number;
  privacy_blocks: number;
  top_diseases: { name: string; count: number }[];
  searches_by_hour: number[];
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const maxSearches = Math.max(...(data.searches_by_hour || [1]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500 rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Network Analytics</h3>
            <p className="text-xs text-slate-500">Real-time diagnostic insights</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100"
        >
          <Activity className="w-5 h-5 text-sky-600 mb-2" />
          <div className="text-2xl font-bold text-sky-900">{data.searches_today || 0}</div>
          <div className="text-xs text-sky-600">Searches Today</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100"
        >
          <TrendingUp className="w-5 h-5 text-emerald-600 mb-2" />
          <div className="text-2xl font-bold text-emerald-900">{Math.round((data.avg_confidence || 0) * 100)}%</div>
          <div className="text-xs text-emerald-600">Avg Confidence</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100"
        >
          <Shield className="w-5 h-5 text-amber-600 mb-2" />
          <div className="text-2xl font-bold text-amber-900">{data.privacy_blocks || 0}</div>
          <div className="text-xs text-amber-600">Privacy Blocks</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100"
        >
          <BarChart3 className="w-5 h-5 text-purple-600 mb-2" />
          <div className="text-2xl font-bold text-purple-900">{data.total_searches || 0}</div>
          <div className="text-xs text-purple-600">All Time</div>
        </motion.div>
      </div>

      {/* Hourly Activity Chart */}
      {data.searches_by_hour && data.searches_by_hour.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Activity Last 24 Hours</h4>
          <div className="flex items-end justify-between gap-1 h-24">
            {data.searches_by_hour.map((count, idx) => (
              <motion.div
                key={idx}
                initial={{ height: 0 }}
                animate={{ height: `${(count / maxSearches) * 100}%` }}
                transition={{ delay: idx * 0.02 }}
                className="flex-1 bg-gradient-to-t from-sky-500 to-cyan-500 rounded-t-sm min-h-[2px]"
                title={`${count} searches`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1 text-xs text-slate-400">
            <span>24h ago</span>
            <span>Now</span>
          </div>
        </div>
      )}

      {/* Top Diseases */}
      {data.top_diseases && data.top_diseases.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">Most Searched Diseases</h4>
          <div className="space-y-2">
            {data.top_diseases.slice(0, 5).map((disease, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-medium text-slate-400 w-4">{idx + 1}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-700">{disease.name}</div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(disease.count / (data.top_diseases[0]?.count || 1)) * 100}%` }}
                        transition={{ delay: idx * 0.1 }}
                        className="h-full bg-gradient-to-r from-sky-500 to-cyan-500"
                      />
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-500">{disease.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Protection Note */}
      <div className="mt-6 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-emerald-600" />
          <p className="text-xs text-emerald-700">
            All metrics are aggregated and privacy-preserving. No patient data exposed.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
