'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { BarChart3, FileText, Clock, TrendingUp, CheckCircle, XCircle, Sparkles, ArrowRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`${bg} p-3 rounded-xl flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
        <p className="text-sm text-[var(--muted)]">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/analyze/history`)
      .then(r => setAnalyses(r.data.analyses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avg = analyses.length ? Math.round(analyses.reduce((s, a) => s + a.matchScore, 0) / analyses.length) : 0;
  const fitCount = analyses.filter(a => a.isFit).length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--bg)]">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#818CF8] p-6 sm:p-8 text-white">
            <div className="relative z-10">
              <p className="text-indigo-200 text-sm font-medium mb-1">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}</p>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{user?.name?.split(' ')[0]} 👋</h1>
              <p className="text-indigo-100 mb-6 text-sm sm:text-base max-w-md">Upload your resume and a job description to get AI-powered feedback and an optimized resume — instantly.</p>
              <Link href="/analyze" className="inline-flex items-center gap-2 bg-white text-[#4F46E5] px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-all shadow-md">
                <Sparkles className="w-4 h-4" />Analyze Resume<ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
            <div className="absolute right-10 -bottom-10 w-28 h-28 bg-white/10 rounded-full pointer-events-none" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Analyses" value={analyses.length} icon={BarChart3} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
            <StatCard label="Average Score" value={`${avg}%`} icon={TrendingUp} color="text-indigo-500" bg="bg-indigo-50 dark:bg-indigo-900/20" />
            <StatCard label="Fit for Role" value={fitCount} icon={CheckCircle} color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-900/20" />
            <StatCard label="Need Improvement" value={analyses.length - fitCount} icon={XCircle} color="text-orange-500" bg="bg-orange-50 dark:bg-orange-900/20" />
          </div>

          {/* Recent */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <h2 className="font-semibold text-[var(--text)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--primary)]" />Recent Analyses
              </h2>
              {analyses.length > 0 && <Link href="/history" className="text-sm text-[var(--primary)] hover:underline font-medium">View all</Link>}
            </div>

            {loading ? (
              <div className="p-10 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[var(--muted)]">Loading...</p>
              </div>
            ) : analyses.length === 0 ? (
              <div className="p-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[var(--border)] rounded-2xl flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-[var(--muted)]" />
                </div>
                <h3 className="font-semibold text-[var(--text)] mb-1">No analyses yet</h3>
                <p className="text-sm text-[var(--muted)] mb-5">Upload your first resume to see results here</p>
                <Link href="/analyze" className="btn-primary text-sm py-2.5 px-5 inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />Start Analyzing
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {analyses.slice(0, 5).map(a => (
                  <div key={a._id} className="px-6 py-4 flex items-center justify-between hover:bg-[var(--bg)] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${a.isFit ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                        {a.isFit ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-orange-500" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-[var(--text)] truncate">{a.fileName || 'Resume'}</p>
                        <p className="text-xs text-[var(--muted)]">{new Date(a.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                      <span className={`font-bold text-sm ${a.matchScore >= 75 ? 'text-emerald-600' : a.matchScore >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {a.matchScore}%
                      </span>
                      <Link href={`/history?id=${a._id}`} className="text-[var(--primary)] hover:opacity-70 transition-opacity">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
