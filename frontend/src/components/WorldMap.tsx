import { motion } from 'framer-motion';

const locations = [
  { id: 'mumbai', x: 70, y: 52, label: 'Mumbai General', patients: '~50', color: '#f97316' },
  { id: 'london', x: 47, y: 25, label: 'London UCH', patients: '~50', color: '#a855f7' },
  { id: 'boston', x: 25, y: 30, label: 'Boston Children\'s', patients: '~50', color: '#3b82f6' },
];

export const WorldMap = ({ activeScan }: { activeScan: boolean }) => {
  return (
    <div className="relative h-[280px] w-full overflow-hidden rounded-2xl border border-white/5 bg-black/40 backdrop-blur-xl">
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 245, 212, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 245, 212, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}
      />

      {/* Glow effects */}
      <div className="absolute inset-0">
        {locations.map(loc => (
          <div
            key={`glow-${loc.id}`}
            className="absolute w-32 h-32 rounded-full blur-3xl opacity-20"
            style={{
              left: `${loc.x}%`,
              top: `${loc.y}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: loc.color
            }}
          />
        ))}
      </div>

      {/* Connection SVG */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          {/* Gradient for active connections */}
          <linearGradient id="connection-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f5d4" stopOpacity="0" />
            <stop offset="50%" stopColor="#00f5d4" stopOpacity="1" />
            <stop offset="100%" stopColor="#00f5d4" stopOpacity="0" />
          </linearGradient>
          
          {/* Static connection gradient */}
          <linearGradient id="static-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
          </linearGradient>

          {/* Pulse filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Static connection lines */}
        <path d="M 70 52 Q 58 35 47 25" stroke="url(#static-gradient)" strokeWidth="0.3" fill="none" strokeDasharray="2,2" />
        <path d="M 70 52 Q 48 40 25 30" stroke="url(#static-gradient)" strokeWidth="0.3" fill="none" strokeDasharray="2,2" />
        <path d="M 25 30 Q 36 26 47 25" stroke="url(#static-gradient)" strokeWidth="0.3" fill="none" strokeDasharray="2,2" />

        {/* Animated connection lines during scan */}
        {activeScan && (
          <>
            {/* Mumbai to London */}
            <motion.path
              d="M 70 52 Q 58 35 47 25"
              stroke="url(#connection-gradient)"
              strokeWidth="0.8"
              fill="none"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Mumbai to Boston */}
            <motion.path
              d="M 70 52 Q 48 40 25 30"
              stroke="url(#connection-gradient)"
              strokeWidth="0.8"
              fill="none"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Boston to London */}
            <motion.path
              d="M 25 30 Q 36 26 47 25"
              stroke="url(#connection-gradient)"
              strokeWidth="0.8"
              fill="none"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2, delay: 0.6, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Data packets animation */}
            {[0, 0.5, 1].map((delay, i) => (
              <motion.circle
                key={`packet-${i}`}
                r="0.8"
                fill="#00f5d4"
                filter="url(#glow)"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  cx: [70, 58, 47],
                  cy: [52, 35, 25]
                }}
                transition={{
                  duration: 1.5,
                  delay: delay,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </>
        )}
      </svg>

      {/* Location nodes */}
      {locations.map((loc) => (
        <motion.div
          key={loc.id}
          className="absolute flex flex-col items-center"
          style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Outer pulse ring */}
          <div className="relative">
            <motion.div
              className="absolute -inset-3 rounded-full"
              style={{ backgroundColor: loc.color }}
              animate={activeScan ? {
                scale: [1, 2, 1],
                opacity: [0.3, 0, 0.3]
              } : {
                scale: [1, 1.5, 1],
                opacity: [0.2, 0, 0.2]
              }}
              transition={{ duration: activeScan ? 1 : 2, repeat: Infinity }}
            />
            
            {/* Inner pulse */}
            <motion.div
              className="absolute -inset-1 rounded-full"
              style={{ backgroundColor: loc.color }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.2, 0.5]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            
            {/* Core dot */}
            <div 
              className="relative w-3 h-3 rounded-full shadow-lg"
              style={{ 
                backgroundColor: loc.color,
                boxShadow: `0 0 20px ${loc.color}80`
              }}
            />
          </div>

          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-3 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10"
          >
            <p className="text-xs font-medium text-white whitespace-nowrap">{loc.label}</p>
            <p className="text-[10px] text-gray-500 text-center">{loc.patients} records</p>
          </motion.div>
        </motion.div>
      ))}

      {/* Status indicator */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/10">
        <div className={`w-1.5 h-1.5 rounded-full ${activeScan ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-500'}`} />
        <span className="text-[10px] font-mono text-gray-400">
          {activeScan ? 'SCANNING...' : 'READY'}
        </span>
      </div>

      {/* Network stats */}
      <div className="absolute bottom-3 right-3 text-right">
        <p className="text-[10px] text-gray-500 font-mono">ENCRYPTED NODES</p>
        <p className="text-sm font-bold text-cyan-400">3 ACTIVE</p>
      </div>
    </div>
  );
};
