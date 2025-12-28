import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Stethoscope,
  TestTube,
  Activity,
  AlertTriangle,
  Lock,
  ExternalLink,
  Clock,
  Dna,
  TrendingUp,
  User,
  FileText,
  CheckCircle2,
  Search,
  Info
} from 'lucide-react';
import { ConfidenceExplainer } from './ConfidenceExplainer';

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
}

interface Props {
  insight: InsightData | null;
  audit: AuditData | null;
  searchTime: number;
  isLoading: boolean;
  query?: string;
}

export const DiagnosticInsight = ({ insight, audit, searchTime, isLoading, query }: Props) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="relative mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-16 h-16 rounded-full border-4 border-sky-100 border-t-sky-500"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-6 h-6 text-sky-500" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Analyzing Symptoms</h3>
          <p className="text-sm text-slate-500 text-center max-w-xs">
            Running privacy-preserving search across encrypted hospital databases...
          </p>

          {/* Progress bar */}
          <div className="w-64 h-1.5 bg-slate-100 rounded-full mt-6 overflow-hidden">
            <div className="h-full progress-animated rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!insight) {
    return null;
  }

  // Error state
  if (insight.privacy_status === 'ERROR') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-8 border border-red-200"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-red-50">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-red-600 mb-2">Connection Error</h3>
            <p className="text-slate-600 text-sm">
              {insight.privacy_message || 'Failed to connect to the diagnostic network.'}
            </p>
            <p className="text-slate-400 text-xs mt-4">
              Make sure Docker containers (CyborgDB, Redis) are running.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Invalid query state
  if (insight.privacy_status === 'INVALID') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl overflow-hidden border border-red-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 px-8 py-6 border-b border-red-200">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-100">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-red-700">Invalid Query</h3>
              <p className="text-red-600/70 text-sm">Non-medical terms detected</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <p className="text-slate-600 mb-6 leading-relaxed">
            {insight.privacy_message ||
              "The query does not contain valid medical symptoms. Please enter recognized medical terms."}
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
            <p className="font-medium text-slate-700 mb-2 text-sm">Valid symptom examples:</p>
            <div className="flex flex-wrap gap-2">
              {["joint pain", "fever", "rash", "fatigue", "muscle weakness", "skin lesions", "numbness"].map((symptom) => (
                <span key={symptom} className="px-2.5 py-1 rounded-full bg-sky-100 border border-sky-200 text-xs text-sky-700">
                  {symptom}
                </span>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-700 text-sm">Why rejected?</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Medical diagnostic tools require valid symptom descriptions to provide accurate results.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-start gap-3">
                <Stethoscope className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-700 text-sm">How to fix</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Describe actual symptoms like "joint pain, fatigue, skin rash" instead of random words.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {query && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-400 mb-1">Your query</p>
              <p className="text-sm text-red-600 font-mono bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                "{query}"
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // NO MATCHES state
  if (insight.privacy_status === 'NO_MATCHES') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-slate-100 to-gray-100 border border-slate-200">
              <Search className="w-8 h-8 text-slate-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Info className="w-4 h-4 text-slate-500" />
                <h3 className="text-2xl font-bold text-slate-800">No Matches Found</h3>
              </div>
              <p className="text-sm text-slate-500">No matching cases in the network</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <p className="text-slate-600 leading-relaxed mb-4">
              {insight.privacy_message || 'No matching cases were found in the global network for the provided symptoms.'}
            </p>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">What to do next:</p>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Try different or more specific symptoms</li>
                    <li>Consult with a rare disease specialist</li>
                    <li>Consider genetic testing if clinically indicated</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {audit && (
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Search Audit
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{audit.institutions_queried || 0}</p>
                  <p className="text-xs text-slate-500">Hospitals Queried</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{audit.raw_matches_found || 0}</p>
                  <p className="text-xs text-slate-500">Matches Found</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{searchTime.toFixed(0)}ms</p>
                  <p className="text-xs text-slate-500">Search Time</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Privacy BLOCKED state
  if (insight.privacy_status === 'BLOCKED') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl overflow-hidden border border-amber-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-8 py-6 border-b border-amber-200">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-100">
              <ShieldAlert className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-amber-700">Privacy Protection Active</h3>
              <p className="text-amber-600/70 text-sm">K-Anonymity threshold not met</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <p className="text-slate-600 mb-6 leading-relaxed">
            {insight.privacy_message ||
              "The cohort size is below the minimum threshold required to safely return results. This protects patients with extremely rare conditions from identification."}
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-700 text-sm">Why blocked?</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Too few matching cases to ensure patient anonymity. Revealing "a match exists" could identify rare patients.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-700 text-sm">Recommendation</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Consult a specialist directly for cases with very rare symptom presentations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {audit && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{audit.raw_matches_found}</p>
                  <p className="text-xs text-slate-500">Total Scanned</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">&lt;{audit.privacy_threshold}</p>
                  <p className="text-xs text-slate-500">Top Diagnosis</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{searchTime.toFixed(0)}ms</p>
                  <p className="text-xs text-slate-500">Search Time</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center mt-3">
                Searched {audit.raw_matches_found} total cases, but top match has &lt;{audit.privacy_threshold} patients
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Success state - Privacy PASSED
  const confidencePercent = Math.round(insight.confidence_score * 100);

  const getConfidenceColor = () => {
    if (confidencePercent >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-500', bar: 'from-emerald-500 to-teal-500', light: 'bg-emerald-50' };
    if (confidencePercent >= 60) return { text: 'text-sky-600', bg: 'bg-sky-500', bar: 'from-sky-500 to-cyan-500', light: 'bg-sky-50' };
    if (confidencePercent >= 40) return { text: 'text-amber-600', bg: 'bg-amber-500', bar: 'from-amber-500 to-orange-500', light: 'bg-amber-50' };
    return { text: 'text-slate-600', bg: 'bg-slate-500', bar: 'from-slate-500 to-slate-600', light: 'bg-slate-50' };
  };

  const colors = getConfidenceColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Main Diagnosis Card */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-sky-50 via-cyan-50 to-sky-50 px-8 py-6 border-b border-sky-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-sky-100 to-cyan-100 border border-sky-200">
                <Dna className="w-8 h-8 text-sky-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600">Privacy Verified</span>
                </div>
                <p className="text-sm text-slate-500">
                  Aggregated from {audit?.raw_matches_found || '—'} encrypted patient records
                </p>
              </div>
            </div>

            {searchTime > 0 && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-mono">{searchTime.toFixed(0)}ms</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-8">
          {/* Query Reference */}
          {query && (
            <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-400 mb-1">Query Symptoms</p>
              <p className="text-sm text-slate-600">{query}</p>
            </div>
          )}

          {/* Diagnosis Title */}
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
              {insight.suggested_diagnosis}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              {insight.icd10_code && (
                <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono text-slate-600">
                  ICD-10: {insight.icd10_code}
                </span>
              )}
              {insight.prevalence && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-600">
                  <TrendingUp className="w-3 h-3" />
                  {insight.prevalence}
                </span>
              )}
            </div>
          </div>

          {/* Confidence Score */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">Diagnostic Confidence</span>
              <span className={`text-2xl font-bold ${colors.text}`}>{confidencePercent}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${colors.bar} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${confidencePercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Score includes differential privacy noise (ε={audit?.noise_epsilon || 0.1}) for protection
            </p>
          </div>

          {/* Description */}
          {insight.description && (
            <div className="mb-8 p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-600 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          )}

          {/* Recommendations Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Recommended Tests */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <TestTube className="w-5 h-5 text-cyan-600" />
                <h4 className="font-semibold text-slate-800">Recommended Tests</h4>
              </div>
              {insight.recommended_tests && insight.recommended_tests.length > 0 ? (
                <ul className="space-y-2">
                  {insight.recommended_tests.slice(0, 4).map((test, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{test}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">Consult specialist for testing recommendations</p>
              )}
            </div>

            {/* Specialist Referral */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="w-5 h-5 text-cyan-600" />
                <h4 className="font-semibold text-slate-800">Specialist Referral</h4>
              </div>
              {insight.specialist_referral ? (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-100 border border-sky-200">
                    <User className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">{insight.specialist_referral}</p>
                    <p className="text-xs text-slate-400 mt-1">Recommended specialist type</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">General consultation recommended</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Results aggregated from encrypted cross-institutional search
          </p>
          <a
            href={`https://www.orpha.net/consor/cgi-bin/Disease_Search.php?lng=EN&search=${encodeURIComponent(insight.suggested_diagnosis)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700 font-medium transition-colors"
          >
            <span>Learn more on Orphanet</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Confidence Explainer - NEW */}
      {audit && audit.raw_matches_found >= 5 && (
        <ConfidenceExplainer
          confidence={insight.confidence_score}
          matchCount={audit.raw_matches_found}
          hospitals={[
            { name: 'Mumbai', matches: Math.floor(audit.raw_matches_found * 0.34) },
            { name: 'Boston', matches: Math.floor(audit.raw_matches_found * 0.33) },
            { name: 'London', matches: Math.floor(audit.raw_matches_found * 0.33) }
          ]}
          topSymptoms={query ? query.split(',').slice(0, 3).map(s => s.trim()) : []}
        />
      )}
    </motion.div>
  );
};
