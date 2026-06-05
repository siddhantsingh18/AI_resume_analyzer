'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import {
  Upload, FileText, X, Loader2, CheckCircle, XCircle,
  Lightbulb, Target, TrendingUp, AlertTriangle, Copy, Download, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import ScoreCircle from '../../components/ScoreCircle';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function KeywordBadge({ word, matched }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mr-1.5 mb-1.5 ${
      matched ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
               : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
    }`}>
      {matched ? '✓' : '✗'} {word}
    </span>
  );
}

export default function AnalyzePage() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showUpdated, setShowUpdated] = useState(false);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) return toast.error('Only PDF and DOCX files are accepted (max 5MB)');
    if (accepted.length > 0) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!file) return toast.error('Please upload your resume');
    if (jd.trim().length < 30) return toast.error('Please enter a detailed job description');

    setLoading(true);
    setResult(null);
    const fd = new FormData();
    fd.append('resume', file);
    fd.append('jobDescription', jd);

    try {
      const res = await axios.post(`${API}/api/analyze`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data.analysis);
      toast.success('Analysis complete!');
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  const copyResume = () => {
    if (result?.updatedResume) {
      navigator.clipboard.writeText(result.updatedResume);
      toast.success('Copied to clipboard!');
    }
  };

  const downloadResume = async () => {
    if (!result?.id) return toast.error('No analysis found to download');
    const toastId = toast.loading('Generating .docx file...');
    try {
      const token = Cookies.get('token');
      const response = await axios.get(
        `${API}/api/analyze/download-docx/${result.id}`,
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
      const baseName = result.fileName
        ? result.fileName.replace(/\.[^/.]+$/, '') + '-optimized.docx'
        : 'optimized-resume.docx';
      a.href = url;
      a.download = baseName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Resume downloaded as .docx!', { id: toastId });
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download resume. Please try again.', { id: toastId });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--bg)]">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-[var(--primary)]" />Analyze Resume
            </h1>
            <p className="text-[var(--muted)] mt-1">Upload your resume and paste a job description to get AI-powered feedback.</p>
          </div>

          {/* Input Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Resume Upload */}
            <div className="card p-6">
              <h2 className="font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--primary)]" />Upload Resume
              </h2>
              <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragActive ? 'border-[var(--primary)] bg-indigo-50 dark:bg-indigo-900/10' : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--bg)]'
              }`}>
                <input {...getInputProps()} />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="font-medium text-sm text-[var(--text)] truncate max-w-[180px]">{file.name}</p>
                      <p className="text-xs text-[var(--muted)]">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setFile(null); }}
                      className="ml-auto text-[var(--muted)] hover:text-red-500 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" />
                    <p className="font-medium text-[var(--text)] mb-1">{isDragActive ? 'Drop it here!' : 'Drag & drop or click to upload'}</p>
                    <p className="text-xs text-[var(--muted)]">Supports PDF and DOCX · Max 5MB</p>
                  </>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="card p-6">
              <h2 className="font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-[var(--primary)]" />Job Description
              </h2>
              <textarea
                value={jd} onChange={e => setJd(e.target.value)} rows={9}
                placeholder="Paste the full job description here...&#10;&#10;Include requirements, responsibilities, and qualifications for the best analysis."
                className="input-field resize-none text-sm"
              />
              <p className="text-xs text-[var(--muted)] mt-1.5">{jd.length} characters</p>
            </div>
          </div>

          {/* Analyze Button */}
          <div className="flex justify-center">
            <button onClick={handleAnalyze} disabled={loading || !file || jd.trim().length < 30}
              className="btn-primary px-10 py-3.5 flex items-center gap-3 text-base">
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" />Analyzing with Groq AI...</>
              ) : (
                <><Sparkles className="w-5 h-5" />Analyze My Resume</>
              )}
            </button>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="card p-6 text-center animate-fade-in">
              <div className="w-12 h-12 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderWidth: 3 }} />
              <p className="font-semibold text-[var(--text)]">Analyzing your resume...</p>
              <p className="text-sm text-[var(--muted)] mt-1">Groq AI is evaluating match score, keywords, and improvements</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div id="results" className="space-y-6 animate-slide-up">

              {/* Score Header */}
              <div className="card p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ScoreCircle score={result.matchScore} />
                  <div className="flex-1 text-center sm:text-left">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-3 ${
                      result.isFit ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                   : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {result.isFit ? <><CheckCircle className="w-4 h-4" />Great Fit for This Role!</> : <><AlertTriangle className="w-4 h-4" />Needs Improvement</>}
                    </div>
                    <p className="text-[var(--text)] leading-relaxed">{result.summary}</p>
                    <p className="text-xs text-[var(--muted)] mt-2">File: {result.fileName}</p>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="card p-5">
                  <h3 className="font-semibold text-[var(--text)] mb-3 flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />Matched Keywords
                  </h3>
                  <div className="flex flex-wrap">
                    {result.matchedKeywords?.map(k => <KeywordBadge key={k} word={k} matched />)}
                    {!result.matchedKeywords?.length && <p className="text-sm text-[var(--muted)]">None found</p>}
                  </div>
                </div>
                <div className="card p-5">
                  <h3 className="font-semibold text-[var(--text)] mb-3 flex items-center gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-500" />Missing Keywords
                  </h3>
                  <div className="flex flex-wrap">
                    {result.missingKeywords?.map(k => <KeywordBadge key={k} word={k} matched={false} />)}
                    {!result.missingKeywords?.length && <p className="text-sm text-[var(--muted)]">None missing!</p>}
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="card p-5">
                  <h3 className="font-semibold text-[var(--text)] mb-3 flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />Strengths
                  </h3>
                  <ul className="space-y-2">
                    {result.strengths?.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[var(--text)]">
                        <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card p-5">
                  <h3 className="font-semibold text-[var(--text)] mb-3 flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />Weaknesses
                  </h3>
                  <ul className="space-y-2">
                    {result.weaknesses?.map((w, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[var(--text)]">
                        <span className="text-orange-500 mt-0.5 flex-shrink-0">✗</span>{w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggestions */}
              <div className="card p-5">
                <h3 className="font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />Improvement Suggestions
                </h3>
                <div className="space-y-3">
                  {result.suggestions?.map((s, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30">
                      <span className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      <p className="text-sm text-[var(--text)]">{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Updated Resume */}
              {result.updatedResume && (
                <div className="card overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[var(--primary)]" />
                      <h3 className="font-semibold text-[var(--text)] text-sm">AI-Optimized Resume Report</h3>
                      <span className="badge-green ml-1">New</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={copyResume} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] transition-all">
                        <Copy className="w-3.5 h-3.5" />Copy
                      </button>
                      <button onClick={downloadResume} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-all">
                        <Download className="w-3.5 h-3.5" />Download .docx
                      </button>
                      <button onClick={() => setShowUpdated(!showUpdated)} className="text-[var(--muted)] hover:text-[var(--text)] transition-colors ml-1">
                        {showUpdated ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {showUpdated && (
                    <div className="p-5">
                      <pre className="text-sm text-[var(--text)] whitespace-pre-wrap font-sans leading-relaxed">
                        {result.updatedResume}
                      </pre>
                    </div>
                  )}
                  {!showUpdated && (
                    <div className="px-5 py-3 text-sm text-[var(--muted)] cursor-pointer hover:bg-[var(--bg)] transition-colors" onClick={() => setShowUpdated(true)}>
                      Click to expand the optimized resume report ↓
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
