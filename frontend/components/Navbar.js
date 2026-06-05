'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FileText, BarChart3, History, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/analyze', label: 'Analyze', icon: Sparkles },
  { href: '/history', label: 'History', icon: History },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[var(--card)] border-b border-[var(--border)] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center shadow-sm">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-[var(--text)]">ResumeAI</span>
          </Link>

          {/* Desktop links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {links.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                    ${pathname === href ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]'}`}>
                  <Icon className="w-4 h-4" />{label}
                </Link>
              ))}
            </div>
          )}

          {/* Right */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--border)]">
                  <div className="w-7 h-7 bg-[var(--primary)] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user.name[0].toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium text-[var(--text)] max-w-[120px] truncate">{user.name}</span>
                </div>
                <button onClick={logout}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-all">
                  <LogOut className="w-4 h-4" />Logout
                </button>
                <button className="md:hidden p-2 rounded-xl hover:bg-[var(--border)] transition-all" onClick={() => setOpen(!open)}>
                  {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {open && user && (
          <div className="md:hidden py-3 border-t border-[var(--border)] animate-fade-in space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 mb-1">
              <div className="w-9 h-9 bg-[var(--primary)] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{user.name[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-[var(--text)]">{user.name}</p>
                <p className="text-xs text-[var(--muted)]">{user.email}</p>
              </div>
            </div>
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${pathname === href ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]'}`}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
            <button onClick={logout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full">
              <LogOut className="w-4 h-4" />Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
