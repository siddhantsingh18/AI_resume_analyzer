'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, Loader2, ArrowLeft, FileText, CheckCircle, ShieldCheck } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import PasswordInput from '../../components/PasswordInput';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm)
      return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/reset-password-direct`, {
        email: form.email,
        newPassword: form.password,
      });
      setSuccess(true);
      toast.success('Password updated successfully!');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="flex justify-end p-4"><ThemeToggle /></header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-slide-up">

          {/* Logo + Title */}
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 bg-[var(--primary)] rounded-2xl items-center justify-center mb-4 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--text)]">Reset Password</h1>
            <p className="text-[var(--muted)] mt-1">
              {success ? 'Redirecting to login...' : 'Enter your email and choose a new password'}
            </p>
          </div>

          <div className="card p-8">
            {success ? (
              /* ── Success state ── */
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="font-semibold text-[var(--text)]">Password updated!</p>
                <p className="text-sm text-[var(--muted)]">Taking you to the login page…</p>
              </div>
            ) : (
              /* ── Reset form ── */
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Email */}
                <div>
                  <label className="label">Email address</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={set}
                      required
                      className="input-field pl-11"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="label">New password</label>
                  <PasswordInput
                    name="password"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={set}
                    required
                    autoComplete="new-password"
                  />
                </div>

                {/* Confirm password */}
                <div>
                  <label className="label">Confirm new password</label>
                  <PasswordInput
                    name="confirm"
                    placeholder="Re-enter new password"
                    value={form.confirm}
                    onChange={set}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Updating...</>
                    : 'Reset Password'}
                </button>
              </form>
            )}

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 mt-5 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />Back to login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
