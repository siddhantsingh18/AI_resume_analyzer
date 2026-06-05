'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Mail, Loader2, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/PasswordInput';
import ThemeToggle from '../../components/ThemeToggle';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="flex justify-end p-4"><ThemeToggle /></header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-slide-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 bg-[var(--primary)] rounded-2xl items-center justify-center mb-4 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--text)]">Welcome back</h1>
            <p className="text-[var(--muted)] mt-1">Sign in to your ResumeAI account</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="label">Email address</label>
                <div className="relative">
                  <input type="email" id="email" name="email" placeholder="you@example.com"
                    value={form.email} onChange={set} required autoComplete="email"
                    className="input-field pl-11" />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="label mb-0">Password</label>
                  <Link href="/forgot-password" className="text-xs text-[var(--primary)] hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput id="password" name="password" placeholder="Enter your password"
                  value={form.password} onChange={set} required />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-1">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</> : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-[var(--muted)] mt-6">
              Don't have an account?{' '}
              <Link href="/register" className="text-[var(--primary)] font-semibold hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
