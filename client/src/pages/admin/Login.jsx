import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Seo from '../../components/ui/Seo';
import { Wordmark } from '../../components/Navbar';

export default function Login() {
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (admin) return <Navigate to="/admin" replace />;

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <Seo title="Admin login" noindex />
      <div className="grain relative hidden overflow-hidden border-r border-line bg-ink-2 lg:block">
        <span className="display absolute -bottom-10 -left-4 text-[42vw] leading-[0.75] text-bone/[0.06]">SA</span>
        <div className="absolute left-12 top-12"><Wordmark /></div>
      </div>
      <div className="flex items-center justify-center px-5 py-16">
        <form onSubmit={submit} className="w-full max-w-sm" noValidate>
          <div className="lg:hidden"><Wordmark /></div>
          <p className="label mt-10 lg:mt-0">Restricted</p>
          <h1 className="display mt-3 text-6xl">Admin login</h1>
          <div className="mt-10 space-y-5">
            <label className="block">
              <span className="label mb-2 block">Email</span>
              <input className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="block">
              <span className="label mb-2 block">Password</span>
              <input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
          </div>
          {error && <p className="mt-5 border border-red-400/40 px-4 py-3 text-sm text-red-300" role="alert">{error}</p>}
          <button type="submit" className="btn-solid mt-8 w-full" disabled={busy || !email || !password}>
            {busy ? 'Signing in…' : 'Sign in'} <ArrowUpRight size={15} aria-hidden />
          </button>
        </form>
      </div>
    </div>
  );
}
