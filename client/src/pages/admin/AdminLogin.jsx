import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter your access code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(code.trim());
      navigate('/admin');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid access code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="card w-full max-w-md p-8"
      >
        <div className="mb-8 text-center">
          <span className="icon-chip mx-auto mb-4 h-14 w-14">
            <Lock size={24} />
          </span>
          <h1 className="font-display text-2xl font-bold">Admin Login</h1>
          <p className="mt-2 text-sm text-muted">
            Enter your admin access code to continue.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label" htmlFor="access-code">
              Access Code
            </label>
            <div className="relative">
              <input
                id="access-code"
                type={showCode ? 'text' : 'password'}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your access code"
                className="input pr-12"
                autoFocus
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCode((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-white"
                aria-label={showCode ? 'Hide code' : 'Show code'}
              >
                {showCode ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="btn-primary w-full px-5 py-2.5 text-sm disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Don't have the code? Contact the site administrator.
        </p>
      </motion.div>
    </div>
  );
}
