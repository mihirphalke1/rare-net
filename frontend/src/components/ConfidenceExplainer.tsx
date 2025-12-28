import { motion } from 'framer-motion';
import { TrendingUp, Building2, Brain, Sparkles } from 'lucide-react';

interface ConfidenceExplainerProps {
  confidence: number;
  matchCount: number;
  hospitals: { name: string; matches: number }[];
  topSymptoms: string[];
}

export function ConfidenceExplainer({ confidence, matchCount, hospitals, topSymptoms }: ConfidenceExplainerProps) {
  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', accent: 'text-emerald-600' };
    if (score >= 0.75) return { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', accent: 'text-sky-600' };
    if (score >= 0.5) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', accent: 'text-amber-600' };
    return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', accent: 'text-red-600' };
  };

  const colors = getConfidenceColor(confidence);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`${colors.bg} ${colors.border} border rounded-xl p-5 mt-4`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Brain className={`w-5 h-5 ${colors.accent}`} />
        <h4 className={`font-semibold ${colors.text}`}>Why {Math.round(confidence * 100)}% Confidence?</h4>
      </div>

      {/* Main Explanation */}
      <p className={`text-sm ${colors.text} mb-4`}>
        Based on <span className="font-bold">{matchCount} similar cases</span> found across the encrypted network.
        The system analyzed symptom patterns and clinical presentations to calculate this confidence score.
      </p>

      {/* Hospital Breakdown */}
      {hospitals && hospitals.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className={`w-4 h-4 ${colors.accent}`} />
            <p className={`text-xs font-medium ${colors.text}`}>Case Distribution by Hospital:</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {hospitals.map((hospital, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * idx }}
                className="bg-white rounded-lg p-2 border border-slate-200"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${colors.accent === 'text-emerald-600' ? 'bg-emerald-500' : colors.accent === 'text-sky-600' ? 'bg-sky-500' : 'bg-amber-500'}`} />
                  <div>
                    <p className="text-xs font-medium text-slate-700">{hospital.name}</p>
                    <p className="text-xs text-slate-500">{hospital.matches} cases</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Top Matched Symptoms */}
      {topSymptoms && topSymptoms.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-4 h-4 ${colors.accent}`} />
            <p className={`text-xs font-medium ${colors.text}`}>Strongest Symptom Matches:</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topSymptoms.map((symptom, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * idx }}
                className={`text-xs px-2 py-1 rounded-md bg-white border ${colors.border} ${colors.text}`}
              >
                {symptom}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Note */}
      <div className="mt-4 pt-3 border-t border-slate-200">
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          Confidence score includes ±5% differential privacy noise for patient protection
        </p>
      </div>
    </motion.div>
  );
}
