import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Sparkles, X } from 'lucide-react';

interface SearchConsoleProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

const SYMPTOM_SUGGESTIONS = [
  "chilblain lesions",
  "raynaud phenomenon",
  "joint pain",
  "strawberry tongue",
  "high fever",
  "rash",
  "muscle weakness",
  "enlarged spleen",
  "bone pain",
  "anemia",
  "fatigue",
  "photosensitivity",
  "seizures",
  "developmental delay",
  "cardiomegaly",
  "respiratory issues",
  "hepatomegaly",
  "skin ulcers",
  "vision problems",
  "hearing loss"
];

export const SearchConsole = ({ onSearch, isSearching }: SearchConsoleProps) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
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
    if (query.length > 0) {
      const lastWord = query.split(',').pop()?.trim().toLowerCase() || '';
      if (lastWord.length > 1) {
        const matches = SYMPTOM_SUGGESTIONS.filter(s => 
          s.toLowerCase().includes(lastWord) && !query.toLowerCase().includes(s.toLowerCase())
        );
        setFilteredSuggestions(matches.slice(0, 5));
        setShowSuggestions(matches.length > 0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
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
    const parts = query.split(',');
    parts.pop();
    const newQuery = parts.length > 0 
      ? parts.join(',') + ', ' + suggestion
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
        {/* Glow effect container */}
        <div className="relative group">
          {/* Animated gradient border */}
          <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 blur-sm transition-opacity duration-500" />
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-500 opacity-30 group-hover:opacity-50 group-focus-within:opacity-70 transition-opacity duration-300" />
          
          {/* Input container */}
          <div className="relative flex items-center rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 overflow-hidden">
            {/* Search icon */}
            <div className="pl-5 pr-2 text-gray-500 group-focus-within:text-cyan-400 transition-colors">
              <Search size={22} />
            </div>
            
            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => filteredSuggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Describe symptoms (e.g., chilblain lesions, joint pain, fatigue)..."
              className="flex-1 bg-transparent px-3 py-4 text-white placeholder-gray-500 outline-none text-lg"
              disabled={isSearching}
            />

            {/* Clear button */}
            {query && !isSearching && (
              <button
                type="button"
                onClick={clearQuery}
                className="p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="m-2 px-6 py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Scanning</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Scan Network</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-2 rounded-xl bg-black/90 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-2">
                <p className="text-xs text-gray-500 px-3 py-2">Add symptom:</p>
                {filteredSuggestions.map((suggestion, idx) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addSuggestion(suggestion)}
                    className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-cyan-500/50 text-xs font-mono">{idx + 1}</span>
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Hint text */}
      <p className="mt-3 text-center text-xs text-gray-600">
        Separate multiple symptoms with commas • Searches across 3 encrypted institutional databases
      </p>
    </div>
  );
};
