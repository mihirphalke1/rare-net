import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Users, Award } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SuccessAnimationProps {
  caseId: string;
  hospitalName: string;
  totalNetworkCases: number;
  onComplete?: () => void;
}

export function CaseSuccessAnimation({ caseId, hospitalName, totalNetworkCases, onComplete }: SuccessAnimationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
    >
      {/* Confetti Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              top: '-10%',
              left: `${Math.random() * 100}%`,
              rotate: Math.random() * 360
            }}
            animate={{
              top: '110%',
              rotate: Math.random() * 720 + 360
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              delay: Math.random() * 0.5,
              ease: 'linear'
            }}
            className={`absolute w-3 h-3 ${
              ['bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'][
                Math.floor(Math.random() * 5)
              ]
            }`}
            style={{
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
            }}
          />
        ))}
      </div>

      {/* Success Card */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-md mx-4 text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 mb-4"
        >
          <Award className="w-10 h-10 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-slate-900 mb-2"
        >
          Case Added Successfully!
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-slate-600 mb-6"
        >
          Your contribution helps doctors worldwide
        </motion.p>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl p-3 border border-sky-100">
            <div className="flex flex-col items-center">
              <Sparkles className="w-5 h-5 text-sky-600 mb-1" />
              <div className="text-lg font-bold text-sky-700">#{caseId}</div>
              <div className="text-xs text-sky-600">Case ID</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-100">
            <div className="flex flex-col items-center">
              <TrendingUp className="w-5 h-5 text-emerald-600 mb-1" />
              <div className="text-lg font-bold text-emerald-700">{totalNetworkCases}</div>
              <div className="text-xs text-emerald-600">Total Cases</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
            <div className="flex flex-col items-center">
              <Users className="w-5 h-5 text-purple-600 mb-1" />
              <div className="text-lg font-bold text-purple-700 text-xs leading-tight">{hospitalName}</div>
              <div className="text-xs text-purple-600">Hospital</div>
            </div>
          </div>
        </motion.div>

        {/* Impact Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200"
        >
          <p className="text-sm text-amber-700 font-medium">
            🎉 Network now stronger! This case will help diagnose future patients faster.
          </p>
        </motion.div>

        {/* Auto-close indicator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 5, ease: 'linear' }}
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-b-3xl origin-left"
        />
      </motion.div>
    </motion.div>
  );
}
