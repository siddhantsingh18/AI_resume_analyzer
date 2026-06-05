'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading) router.replace(user ? '/dashboard' : '/login');
  }, [user, loading, router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
    </div>
  );
}
