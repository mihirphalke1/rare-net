import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, 
  Lock, 
  LogIn, 
  AlertCircle, 
  Building2,
  Shield,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { Logo } from '../components/Logo';

// Demo credentials for quick access
const DEMO_ACCOUNTS = [
  { email: 'doctor@mumbai.hospital', password: 'password123', hospital: 'Mumbai', role: 'Doctor' },
  { email: 'doctor@boston.hospital', password: 'password123', hospital: 'Boston', role: 'Doctor' },
  { email: 'doctor@london.hospital', password: 'password123', hospital: 'London', role: 'Doctor' },
  { email: 'admin@rarenet.org', password: 'admin123', hospital: 'Global', role: 'Admin' },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/search');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setIsLoading(true);

    try {
      await login(account.email, account.password);
      navigate('/search');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Logo size={56} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign in to RareNet
          </h1>
          <p className="text-slate-500 mt-2">
            Access the diagnostic network
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.org"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Secured with JWT authentication</span>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6">
          <p className="text-sm text-slate-500 text-center mb-3">
            Quick Demo Login:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => handleDemoLogin(account)}
                disabled={isLoading}
                className="group p-3 rounded-xl bg-white/50 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400 group-hover:text-sky-500" />
                  <span className="text-sm font-medium text-slate-700">{account.hospital}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{account.role}</p>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

