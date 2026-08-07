import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [code, setCode] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(code);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-px flex min-h-[70vh] items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card w-full max-w-md p-8"
      >
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black shadow-lg shadow-white/10">
            <KeyRound size={24} />
          </span>
          <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
          <p className="mt-1.5 text-sm text-muted">Enter your access code to manage the site</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label" htmlFor="code">Admin Access Code</label>
            <div className="relative">
              <input
                id="code"
                type={show ? 'text' : 'password'}
                className="input pr-11 text-center font-mono text-lg tracking-[0.4em]"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="••••"
                autoComplete="off"
                inputMode="numeric"
                required
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide code' : 'Show code'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
              >
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-[#161616] px-4 py-3 text-sm font-medium text-white"
            >
              <AlertCircle size={16} /> {error}
            </motion.p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Opening panel...' : 'Open Admin Panel'}
          </button>
        </form>

        <div className="mt-6 border-t border-edge pt-5 text-center">
          <p className="text-xs text-muted">
            Default code: <code className="rounded bg-surface px-1.5 py-0.5 text-white">2006</code>
          </p>
          <p className="mt-2 text-xs text-muted">
            Change it from Settings in the dashboard, or with{' '}
            <code className="text-accent">ADMIN_CODE</code> in server/.env
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-white"
          >
            <ArrowLeft size={15} /> Back to site
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
