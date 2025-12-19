import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Sparkles, X, ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SearchConsoleProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

const SYMPTOM_SUGGESTIONS = [
  "joint hypermobility", "stretchy skin", "easy bruising", "chronic fatigue",
  "strawberry tongue", "prolonged fever", "skin rash", "conjunctivitis",
  "chilblain lesions", "raynaud phenomenon", "photosensitivity",
  "muscle weakness", "cardiomegaly", "respiratory issues",
  "bone pain", "enlarged spleen", "developmental delay",
  "seizures", "hearing loss", "vision problems"
];

// Common medical terms for client-side validation
const MEDICAL_TERMS = new Set([
  // General symptoms
  "pain", "ache", "fever", "fatigue", "weakness", "swelling", "inflammation",
  "bleeding", "bruising", "rash", "lesion", "ulcer", "numbness", "tingling",
  "stiffness", "tenderness", "discomfort", "burning", "itching", "cramping",
  // Body parts
  "joint", "muscle", "bone", "skin", "eye", "ear", "nose", "throat", "chest",
  "abdomen", "back", "neck", "head", "face", "hand", "foot", "arm", "leg",
  "finger", "toe", "heart", "lung", "liver", "kidney", "spleen", "brain",
  "tongue", "lip", "scalp", "nail", "hair", "teeth",
  // Medical descriptors
  "chronic", "acute", "progressive", "recurrent", "bilateral", "severe",
  "mild", "moderate", "intermittent", "persistent", "sudden", "gradual",
  // Specific symptoms
  "hypermobility", "hypotonia", "tachycardia", "bradycardia", "arrhythmia",
  "dyspnea", "cough", "wheeze", "apnea", "cyanosis", "pallor", "jaundice",
  "edema", "hepatomegaly", "splenomegaly", "lymphadenopathy", "cardiomegaly",
  "anemia", "thrombocytopenia", "seizure", "tremor", "ataxia", "dystonia",
  "chorea", "spasticity", "paralysis", "neuropathy", "myopathy",
  "dementia", "confusion", "aphasia", "dysarthria", "dysphagia",
  "nausea", "vomiting", "diarrhea", "constipation", "anorexia",
  "alopecia", "hyperhidrosis", "pruritus", "urticaria", "eczema",
  "erythema", "petechiae", "photosensitivity", "raynaud", "chilblain",
  "arthralgia", "arthritis", "myalgia", "osteoporosis", "fracture",
  "scoliosis", "deformity", "malformation", "dysplasia", "atrophy",
  "retardation", "delay", "regression", "decline", "failure",
  // Common symptom phrases
  "strawberry", "high", "low", "loss", "gain", "difficulty", "trouble",
  "enlarged", "small", "large", "short", "tall", "thin", "thick",
  "red", "blue", "yellow", "white", "dark", "pale",
  "hot", "cold", "dry", "moist", "hard", "soft", "tender", "sensitive",
  "vision", "hearing", "smell", "taste", "balance", "sleep", "appetite",
  "weight", "growth", "development", "breathing", "swallowing", "walking"
]);

function validateQuery(query: string): { isValid: boolean; validTerms: string[]; invalidTerms: string[] } {
  const words = query.toLowerCase()
    .replace(/[,;./\\|_-]/g, ' ')
    .split(' ')
    .map(w => w.trim())
    .filter(w => w.length > 2);
  
  if (words.length === 0) {
    return { isValid: false, validTerms: [], invalidTerms: [] };
  }
  
  const validTerms: string[] = [];
  const invalidTerms: string[] = [];
  
  for (const word of words) {
    let isValid = MEDICAL_TERMS.has(word);
    
    // Check if word is part of any known suggestion
    if (!isValid) {
      for (const suggestion of SYMPTOM_SUGGESTIONS) {
        if (suggestion.includes(word) || word.includes(suggestion.split(' ')[0])) {
          isValid = true;
          break;
        }
      }
    }
    
    // Check medical suffixes
    if (!isValid) {
      const suffixes = ['itis', 'osis', 'emia', 'pathy', 'algia', 'megaly', 'penia', 'rrhea'];
      for (const suffix of suffixes) {
        if (word.endsWith(suffix)) {
          isValid = true;
          break;
        }
      }
    }
    
    if (isValid) {
      validTerms.push(word);
    } else {
      invalidTerms.push(word);
    }
  }
  
  const ratio = validTerms.length / (validTerms.length + invalidTerms.length);
  return {
    isValid: ratio >= 0.5 && validTerms.length >= 1,
    validTerms,
    invalidTerms
  };
}

export const SearchConsole = ({ onSearch, isSearching }: SearchConsoleProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [validation, setValidation] = useState<{ isValid: boolean; validTerms: string[]; invalidTerms: string[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 0 && isFocused) {
      const lastWord = query.split(',').pop()?.trim().toLowerCase() || '';
      if (lastWord.length >= 2) {
        const matches = SYMPTOM_SUGGESTIONS.filter(s => 
          s.toLowerCase().includes(lastWord) && 
          !query.toLowerCase().includes(s.toLowerCase())
        );
        setFilteredSuggestions(matches.slice(0, 6));
        setShowSuggestions(matches.length > 0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  }, [query, isFocused]);

  // Validate query as user types
  useEffect(() => {
    if (query.trim().length >= 3) {
      const result = validateQuery(query);
      setValidation(result);
    } else {
      setValidation(null);
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isSearching) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  const addSuggestion = (suggestion: string) => {
    const parts = query.split(',').map(s => s.trim()).filter(Boolean);
    parts.pop();
    const newQuery = parts.length > 0 
      ? [...parts, suggestion].join(', ')
      : suggestion;
    setQuery(newQuery);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="w-full relative">
      <form onSubmit={handleSubmit}>
        <div className="relative group">
          {/* Glow effect */}
          <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-sky-400/40 via-cyan-400/40 to-sky-400/40 blur-xl transition-opacity duration-500 ${
            isFocused ? 'opacity-60' : 'opacity-0 group-hover:opacity-30'
          }`} />
          
          {/* Border gradient */}
          <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-sky-500 transition-opacity duration-300 ${
            isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
          }`} />
          
          {/* Input container */}
          <div className="relative flex items-center rounded-2xl bg-white shadow-lg shadow-slate-200/50 overflow-hidden">
            {/* Search icon */}
            <div className={`pl-5 pr-2 transition-colors duration-200 ${
              isFocused ? 'text-sky-500' : 'text-slate-400'
            }`}>
              <Search size={22} />
            </div>
            
            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Describe symptoms: joint pain, fever, skin rash..."
              className="flex-1 bg-transparent px-4 py-5 text-slate-800 placeholder-slate-400 outline-none text-base font-medium"
              disabled={isSearching}
              autoComplete="off"
              spellCheck={false}
            />

            {/* Clear button */}
            <AnimatePresence>
              {query && !isSearching && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="button"
                  onClick={clearQuery}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isSearching || !query.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`m-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 flex items-center gap-2 shadow-lg ${
                validation && !validation.isValid && query.trim()
                  ? 'bg-gradient-to-r from-red-400 to-orange-400 hover:from-red-500 hover:to-orange-500 shadow-red-500/20'
                  : 'bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 shadow-sky-500/30'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isSearching ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Scanning</span>
                </>
              ) : validation && !validation.isValid && query.trim() ? (
                <>
                  <AlertCircle size={18} />
                  <span>Invalid</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Diagnose</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="absolute z-50 w-full mt-2 rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50"
            >
              <div className="p-2">
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400">
                  <ChevronDown size={14} />
                  <span>Add symptom</span>
                </div>
                {filteredSuggestions.map((suggestion, idx) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addSuggestion(suggestion)}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-slate-600 hover:bg-sky-50 hover:text-sky-700 transition-colors flex items-center gap-3 group"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-100 group-hover:bg-sky-100 flex items-center justify-center text-xs font-mono text-slate-500 group-hover:text-sky-600 transition-colors">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{suggestion}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Validation feedback */}
      <AnimatePresence>
        {validation && query.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3"
          >
            {validation.isValid ? (
              <div className="flex items-center justify-center gap-2 text-sm text-emerald-600">
                <CheckCircle2 size={16} />
                <span>Valid medical query</span>
                {validation.invalidTerms.length > 0 && (
                  <span className="text-slate-400 text-xs">
                    (ignoring: {validation.invalidTerms.slice(0, 2).join(', ')})
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle size={16} />
                  <span>Invalid query - please enter medical symptoms</span>
                </div>
                {validation.invalidTerms.length > 0 && (
                  <span className="text-xs text-red-400">
                    Unrecognized: "{validation.invalidTerms.slice(0, 3).join('", "')}"
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper text */}
      {!validation && (
        <p className="mt-4 text-center text-sm text-slate-400">
          Enter comma-separated symptoms • Searches across <span className="text-sky-600 font-medium">8 encrypted hospital databases</span>
        </p>
      )}
    </div>
  );
};
