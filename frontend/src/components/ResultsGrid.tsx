import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  FileText, 
  Activity, 
  Building2, 
  Stethoscope,
  Pill,
  AlertCircle,
  ExternalLink,
  Users
} from 'lucide-react';

interface DiseaseInfo {
  icd10: string;
  prevalence: string;
  description: string;
  specialist: string;
  treatment: string[];
}

interface Result {
  id: string;
  score: number;
  metadata: {
    diagnosis: string;
    institution_id: string;
    patient_id: string;
  };
  source_institution: string;
  disease_info?: DiseaseInfo | null;
}

interface ResultsGridProps {
  results: Result[];
  isLoading?: boolean;
}

const INSTITUTION_INFO: Record<string, { name: string; location: string; color: string }> = {
  mumbai: { name: "Mumbai General Hospital", location: "Mumbai, India", color: "orange" },
  boston: { name: "Boston Children's Hospital", location: "Boston, USA", color: "blue" },
  london: { name: "University College Hospital", location: "London, UK", color: "purple" }
};

const getScoreColor = (score: number): string => {
  if (score >= 0.8) return "text-emerald-400";
  if (score >= 0.6) return "text-cyan-400";
  if (score >= 0.4) return "text-yellow-400";
  return "text-gray-400";
};

const getScoreBg = (score: number): string => {
  if (score >= 0.8) return "bg-emerald-500/10 border-emerald-500/20";
  if (score >= 0.6) return "bg-cyan-500/10 border-cyan-500/20";
  if (score >= 0.4) return "bg-yellow-500/10 border-yellow-500/20";
  return "bg-gray-500/10 border-gray-500/20";
};

const getInstitutionColor = (institution: string): string => {
  const colors: Record<string, string> = {
    mumbai: "from-orange-500/20 to-red-500/20 border-orange-500/30",
    boston: "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
    london: "from-purple-500/20 to-pink-500/20 border-purple-500/30"
  };
  return colors[institution] || "from-gray-500/20 to-gray-600/20 border-gray-500/30";
};

export const ResultsGrid = ({ results, isLoading }: ResultsGridProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="glass-card rounded-2xl p-6 animate-pulse"
          >
            <div className="flex justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-white/10" />
              <div className="h-6 w-20 rounded-full bg-white/10" />
            </div>
            <div className="h-6 w-3/4 rounded bg-white/10 mb-2" />
            <div className="h-4 w-1/2 rounded bg-white/10 mb-4" />
            <div className="h-20 rounded-xl bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card rounded-2xl p-12 text-center"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-500/10 flex items-center justify-center">
          <AlertCircle size={28} className="text-yellow-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Matches Found</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          No similar cases found in the network. Try using different symptom descriptions or adding more symptoms.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <AnimatePresence mode="popLayout">
        {results.map((result, index) => {
          const institution = INSTITUTION_INFO[result.source_institution] || {
            name: result.source_institution,
            location: "Unknown",
            color: "gray"
          };
          const diagnosis = result.metadata?.diagnosis || "Unknown Diagnosis";
          const isUnknown = diagnosis === "Unknown" || !diagnosis;
          
          return (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.08, duration: 0.3 }}
              className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${getInstitutionColor(result.source_institution)} backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]`}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-teal-500/5" />
              </div>

              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-black/30">
                      <FileText size={20} className="text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-mono">Case Match</p>
                      <p className="text-xs text-gray-600">#{result.metadata?.patient_id?.slice(0, 8) || result.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  
                  {/* Score Badge */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${getScoreBg(result.score)}`}>
                    <Activity size={14} className={getScoreColor(result.score)} />
                    <span className={`text-sm font-bold ${getScoreColor(result.score)}`}>
                      {(result.score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="mb-4">
                  <h3 className={`text-lg font-semibold mb-1 ${isUnknown ? 'text-yellow-400' : 'text-white'}`}>
                    {isUnknown ? "Undiagnosed Case" : diagnosis}
                  </h3>
                  {result.disease_info?.icd10 && (
                    <span className="text-xs text-gray-500 font-mono">
                      ICD-10: {result.disease_info.icd10}
                    </span>
                  )}
                </div>

                {/* Institution Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <Building2 size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-300">{institution.name}</span>
                  <span className="text-xs text-gray-600">• {institution.location}</span>
                </div>

                {/* Disease Info (if available) */}
                {result.disease_info && (
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    {/* Prevalence */}
                    {result.disease_info.prevalence && (
                      <div className="flex items-start gap-2">
                        <Users size={14} className="text-cyan-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Prevalence</p>
                          <p className="text-sm text-gray-300">{result.disease_info.prevalence}</p>
                        </div>
                      </div>
                    )}

                    {/* Specialist */}
                    {result.disease_info.specialist && (
                      <div className="flex items-start gap-2">
                        <Stethoscope size={14} className="text-cyan-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Refer to</p>
                          <p className="text-sm text-gray-300">{result.disease_info.specialist}</p>
                        </div>
                      </div>
                    )}

                    {/* Treatments */}
                    {result.disease_info.treatment && result.disease_info.treatment.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Pill size={14} className="text-cyan-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Treatment Options</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {result.disease_info.treatment.slice(0, 3).map((t, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-black/30 text-gray-400">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Lock size={12} />
                    <span>Encrypted Vector Match</span>
                  </div>
                  <button className="flex items-center gap-1 text-xs text-cyan-500 hover:text-cyan-400 transition-colors">
                    <span>Details</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
