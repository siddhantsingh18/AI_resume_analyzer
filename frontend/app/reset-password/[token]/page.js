'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, FileText } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import PasswordInput from '../../../components/PasswordInput';
import ThemeToggle from '../../../components/ThemeToggle';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const { token } = useParams();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await resetPassword(token, form.password);
      toast.success('Password reset successfully!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed. Link may have expired.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="flex justify-end p-4"><ThemeToggle /></header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 bg-[var(--primary)] rounded-2xl items-center justify-center mb-4 shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--text)]">Set New Password</h1>
            <p className="text-[var(--muted)] mt-1">Enter your new password below</p>
          </div>
          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">New password</label>
                <PasswordInput name="password" placeholder="Min. 6 characters" value={form.password} onChange={set} required autoComplete="new-password" />
              </div>
              <div>
                <label className="label">Confirm password</label>
                <PasswordInput name="confirm" placeholder="Re-enter new password" value={form.confirm} onChange={set} required autoComplete="new-password" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Resetting...</> : 'Reset Password'}
              </button>
            </form>
            <Link href="/login" className="flex items-center justify-center gap-2 mt-5 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors">
              <ArrowLeft className="w-4 h-4" />Back to login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
