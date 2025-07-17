'use client';

import { hasAdminRoleClient } from '@/lib/clientRoleUtils';
import { RootState } from '@/store';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const reduxUser = useSelector((state: RootState) => state.user.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function checkAdminAccess() {
      if (status === 'loading') return;

      if (!session?.user) {
        router.push('/auth/signin');
        return;
      }

      // Use Redux user data for role checking
      const isAdmin = hasAdminRoleClient(reduxUser);

      if (!isAdmin) {
        router.push('/dashboard');
        return;
      }

      setLoading(false);
    }

    checkAdminAccess();
  }, [session, status, router, reduxUser]);

  if (status === 'loading' || loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        <span className='ml-2 text-gray-600'>Loading...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Authentication Required</h1>
          <p className='text-gray-600'>Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
