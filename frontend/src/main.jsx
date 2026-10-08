import { useContext, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { AuthContext, AuthProvider } from './AuthContext';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  const { user, login, register } = useContext(AuthContext);
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) return <Dashboard />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (isRegistering) await register(name, email, password);
      else await login(email, password);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to connect. Check that the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <section className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <ShieldCheck className="h-9 w-9 text-emerald-400" aria-hidden="true" />
          <h1 className="text-3xl font-bold">SecureStash</h1>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-7 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <LockKeyhole className="h-5 w-5 text-emerald-400" aria-hidden="true" />
            <h2 className="text-xl font-semibold">{isRegistering ? 'Create your account' : 'Sign in'}</h2>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegistering && (
              <label className="block text-sm text-slate-300">
                Name
                <input className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white" value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
            )}
            <label className="block text-sm text-slate-300">
              Email
              <input className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="block text-sm text-slate-300">
              Password
              <input className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
            <button className="w-full rounded bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait...' : isRegistering ? 'Create account' : 'Sign in'}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-400">
            {isRegistering ? 'Already have an account?' : 'New to SecureStash?'}{' '}
            <button className="font-medium text-emerald-400 hover:text-emerald-300" type="button" onClick={() => { setError(''); setIsRegistering(!isRegistering); }}>
              {isRegistering ? 'Sign in' : 'Create account'}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);