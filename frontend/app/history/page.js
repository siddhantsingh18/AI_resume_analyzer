'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  CheckCircle, XCircle, FileText, Clock, ChevronRight,
  ArrowLeft, Lightbulb, TrendingUp, AlertTriangle, Copy, Download, Target, X
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import ScoreCircle from '../../components/ScoreCircle';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function KeywordBadge({ word, matched }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mr-1.5 mb-1.5 ${
      matched ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
               : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
    }`}>{matched ? '✓' : '✗'} {word}</span>
  );
}

function DetailModal({ analysis, onClose }) {
  const copyResume = () => { navigator.clipboard.writeText(analysis.updatedResume); toast.success('Copied!'); };
  const downloadResume = async () => {
    const toastId = toast.loading('Generating .docx file...');
    try {
      const token = Cookies.get('token');
      const response = await axios.get(
        `${API}/api/analyze/download-docx/${analysis._id}`,
        {
          responseType: 'arraybuffer',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const baseName = analysis.fileName
        ? analysis.fileName.replace(/\.[^/.]+$/, '') + '-optimized.docx'
        : 'optimized-resume.docx';
      a.href = url;
      a.download = baseName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Downloaded as .docx!', { id: toastId });
    } catch (err) {
      toast.error('Failed to download. Please try again.', { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-[var(--card)] w-full sm:max-w-3xl sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-[var(--text)]">Analysis Details</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--border)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Score */}
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <ScoreCircle score={analysis.matchScore} size={140} />
            <div className="flex-1 text-center sm:text-left">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                analysis.isFit ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
              }`}>
                {analysis.isFit ? <><CheckCircle className="w-3.5 h-3.5" />Fit for Role</> : <><AlertTriangle className="w-3.5 h-3.5" />Needs Improvement</>}
              </div>
              {analysis.summary && <p className="text-sm text-[var(--text)] leading-relaxed">{analysis.summary}</p>}
              <p className="text-xs text-[var(--muted)] mt-2">
                {analysis.fileName} · {new Date(analysis.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Keywords */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card p-4">
              <h4 className="text-sm font-semibold text-[var(--text)] mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />Matched
              </h4>
              <div className="flex flex-wrap">
                {analysis.matchedKeywords?.map(k => <KeywordBadge key={k} word={k} matched />)}
              </div>
            </div>
            <div className="card p-4">
              <h4 className="text-sm font-semibold text-[var(--text)] mb-2 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-500" />Missing
              </h4>
              <div className="flex flex-wrap">
                {analysis.missingKeywords?.map(k => <KeywordBadge key={k} word={k} matched={false} />)}
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-[var(--text)] mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />Strengths
              </h4>
              <ul className="space-y-1.5">
                {analysis.strengths?.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-[var(--text)]">
                    <span className="text-emerald-500 flex-shrink-0">✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text)] mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />Weaknesses
              </h4>
              <ul className="space-y-1.5">
                {analysis.weaknesses?.map((w, i) => (
                  <li key={i} className="flex gap-2 text-sm text-[var(--text)]">
                    <span className="text-orange-500 flex-shrink-0">✗</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggestions */}
          {analysis.suggestions?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[var(--text)] mb-3 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />Suggestions
              </h4>
              <div className="space-y-2">
                {analysis.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30">
                    <span className="w-5 h-5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    <p className="text-sm text-[var(--text)]">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Updated Resume */}
          {analysis.updatedResume && (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-indigo-50 dark:bg-indigo-900/20">
                <span className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--primary)]" />AI-Optimized Resume Report
                </span>
                <div className="flex gap-2">
                  <button onClick={copyResume} className="text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-1 transition-all">
                    <Copy className="w-3 h-3" />Copy
                  </button>
                  <button onClick={downloadResume} className="text-xs px-2.5 py-1.5 rounded-lg bg-[var(--primary)] text-white flex items-center gap-1 hover:opacity-90 transition-all">
                    <Download className="w-3 h-3" />Save .docx
                  </button>
                </div>
              </div>
              <div className="p-4 max-h-72 overflow-y-auto">
                <pre className="text-xs text-[var(--text)] whitespace-pre-wrap font-sans leading-relaxed">{analysis.updatedResume}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    axios.get(`${API}/api/analyze/history`)
      .then(r => {
        const list = r.data.analyses || [];
        setAnalyses(list);
        const id = searchParams.get('id');
        if (id) openDetail(id);
      })
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  const openDetail = async (id) => {
    setDetailLoading(true);
    try {
      const r = await axios.get(`${API}/api/analyze/${id}`);
      setSelected(r.data.analysis);
    } catch { toast.error('Failed to load analysis'); }
    finally { setDetailLoading(false); }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--bg)]">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-[var(--primary)]" />
            <div>
              <h1 className="text-2xl font-bold text-[var(--text)]">Analysis History</h1>
              <p className="text-sm text-[var(--muted)]">{analyses.length} total analyses</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[var(--muted)]">Loading history...</p>
            </div>
          ) : analyses.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-[var(--border)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-[var(--muted)]" />
              </div>
              <h3 className="font-semibold text-[var(--text)] mb-1">No history yet</h3>
              <p className="text-sm text-[var(--muted)] mb-5">Start by analyzing your first resume</p>
              <Link href="/analyze" className="btn-primary text-sm py-2.5 px-5 inline-flex">Analyze Now</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.map(a => (
                <div key={a._id} onClick={() => openDetail(a._id)}
                  className="card p-5 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-[var(--primary)]/30 transition-all group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      a.isFit ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
                    }`}>
                      {a.isFit ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-orange-500" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-[var(--text)] truncate">{a.fileName || 'Resume'}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className={`font-bold ${a.matchScore >= 75 ? 'text-emerald-600' : a.matchScore >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {a.matchScore}%
                      </p>
                      <p className="text-xs text-[var(--muted)]">Match</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold hidden sm:inline-flex ${
                      a.isFit ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                               : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>{a.isFit ? 'Fit' : 'Improve'}</span>
                    <ChevronRight className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {selected && <DetailModal analysis={selected} onClose={() => setSelected(null)} />}
      {detailLoading && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-[var(--card)] rounded-2xl p-8 flex flex-col items-center gap-3 shadow-2xl">
            <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-[var(--text)]">Loading analysis...</p>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
