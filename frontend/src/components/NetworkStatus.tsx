import { motion } from 'framer-motion';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface NetworkStatusProps {
  status: 'checking' | 'online' | 'offline';
}

export const NetworkStatus = ({ status }: NetworkStatusProps) => {
  const getConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: Wifi,
          text: 'Network Online',
          className: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          dotClass: 'bg-emerald-500',
          animate: true
        };
      case 'offline':
        return {
          icon: WifiOff,
          text: 'Offline',
          className: 'bg-red-50 border-red-200 text-red-600',
          dotClass: 'bg-red-500',
          animate: false
        };
      default:
        return {
          icon: Loader2,
          text: 'Connecting',
          className: 'bg-amber-50 border-amber-200 text-amber-700',
          dotClass: 'bg-amber-500',
          animate: false
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.className}`}>
      {/* Animated dot */}
      <span className="relative flex h-2 w-2">
        {config.animate && (
          <span className={`absolute inline-flex h-full w-full rounded-full ${config.dotClass} opacity-75 animate-ping`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dotClass}`} />
      </span>
      
      {/* Icon */}
      {status === 'checking' ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Icon className="w-4 h-4" />
        </motion.div>
      ) : (
        <Icon className="w-4 h-4" />
      )}
      
      {/* Text */}
      <span className="text-xs font-medium hidden sm:inline">{config.text}</span>
    </div>
  );
};
