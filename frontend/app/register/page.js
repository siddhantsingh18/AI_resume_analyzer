'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Mail, User, Loader2, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/PasswordInput';
import ThemeToggle from '../../components/ThemeToggle';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="flex justify-end p-4"><ThemeToggle /></header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 bg-[var(--primary)] rounded-2xl items-center justify-center mb-4 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--text)]">Create account</h1>
            <p className="text-[var(--muted)] mt-1">Start your AI-powered resume journey</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Full name</label>
                <div className="relative">
                  <input type="text" name="name" placeholder="John Doe" value={form.name} onChange={set}
                    required className="input-field pl-11" />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                </div>
              </div>
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={set}
                    required className="input-field pl-11" />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <PasswordInput name="password" placeholder="Min. 6 characters" value={form.password} onChange={set} required autoComplete="new-password" />
              </div>
              <div>
                <label className="label">Confirm password</label>
                <PasswordInput name="confirm" placeholder="Re-enter password" value={form.confirm} onChange={set} required autoComplete="new-password" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-1">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : 'Create Account'}
              </button>
            </form>
            <p className="text-center text-sm text-[var(--muted)] mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-[var(--primary)] font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
