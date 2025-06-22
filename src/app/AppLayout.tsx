/* eslint-disable */
'use client';

import { useState, ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { SignedIn, useUser } from '@clerk/nextjs';

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
    <div className="w-full min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header
        onToggleSidebar={isSignedIn ? toggleSidebar : () => {}}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex flex-1 w-full">
        {isSignedIn && <Sidebar isOpen={isSidebarOpen} />}
        <main
          className={`flex-1 flex flex-col items-center px-4 sm:px-6 md:px-8 w-full transition-all duration-300 ease-in-out ${
            isSignedIn && isSidebarOpen ? 'ml-0 md:ml-42' : 'ml-0'
          }`}
        >
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
