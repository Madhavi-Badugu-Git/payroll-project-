import Link from 'next/link';
import { SignedIn } from '@clerk/nextjs';
import { usePathname } from 'next/navigation'; // Import usePathname

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname(); // Get current pathname

  const linkClasses = (path: string) => {
    const isActive = pathname === path;
    return `font-medium hover:text-blue-500 ${isActive ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-800 dark:text-white'}`;
  };

  return (
    <SignedIn>
      <aside
        className={`w-64 min-h-screen bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4 fixed top-0 left-0 z-20 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="mt-16 md:mt-0"> {/* Add margin-top to avoid overlap with sticky header on mobile */}
          <nav className="flex flex-col gap-3">
            <Link href="/" className={linkClasses("/")}>Home</Link>
            <Link href="/employees" className={linkClasses("/employees")}>Employees</Link>
            <Link href="/attendance" className={linkClasses("/attendance")}>Attendance</Link>
            <Link href="/leaves" className={linkClasses("/leaves")}>Leaves</Link>
            <Link href="/payslip" className={linkClasses("/payslip")}>Payslips</Link>
            <Link href="/holidays" className={linkClasses("/holidays")}>Holidays</Link>
          </nav>
        </div>
      </aside>
    </SignedIn>
  );
}
