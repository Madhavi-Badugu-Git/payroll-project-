'use client';

import { useUser } from '@clerk/nextjs';
import { ReactNode, useState } from 'react';
import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isSignedIn } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className='w-full min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950'>
      <Header
        onToggleSidebar={isSignedIn ? toggleSidebar : () => {}}
        isSidebarOpen={isSidebarOpen}
      />
      <div className='flex flex-1 w-full'>
        {isSignedIn && <Sidebar isOpen={isSidebarOpen} />}
        <main
          className={`flex-1 flex flex-col items-center px-4 sm:px-6 md:px-8 w-full transition-all duration-300 ease-in-out ${
            isSignedIn && isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
          }`}
        >
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
