import { motion } from 'framer-motion';
import { Activity, Shield, Wifi, WifiOff } from 'lucide-react';

interface NavbarProps {
  status: 'checking' | 'online' | 'offline';
}

export const Navbar = ({ status }: NavbarProps) => {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 blur-md opacity-50" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600">
                <Activity size={22} className="text-white" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Rare<span className="text-cyan-400">Net</span>
              </span>
              <p className="text-[10px] text-gray-500 -mt-1 tracking-wider">
                DIAGNOSTIC NETWORK
              </p>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-4">
            {/* Network Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              status === 'online' 
                ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400' 
                : status === 'checking'
                ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {status === 'online' ? (
                <Wifi size={14} />
              ) : status === 'checking' ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Wifi size={14} />
                </motion.div>
              ) : (
                <WifiOff size={14} />
              )}
              <span className="hidden sm:inline">
                {status === 'online' ? 'Network Online' : status === 'checking' ? 'Connecting' : 'Offline'}
              </span>
            </div>

            {/* Encryption Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
              <Shield size={14} />
              <span className="hidden sm:inline">CyborgDB Encrypted</span>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-2">
              <div className="relative h-2.5 w-2.5">
                <span className={`absolute inset-0 rounded-full ${status === 'online' ? 'bg-emerald-400 animate-ping' : 'bg-gray-500'} opacity-75`} />
                <span className={`relative flex h-2.5 w-2.5 rounded-full ${status === 'online' ? 'bg-emerald-500' : 'bg-gray-600'}`} />
              </div>
              <span className="text-xs text-gray-400 hidden md:inline">
                {status === 'online' ? 'Live' : 'Standby'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
