import AppLayout from '../AppLayout';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    // This should ideally be handled by middleware,
    // but as a fallback, redirect if not authenticated.
    redirect('/sign-in');
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder for Dashboard Widgets */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-medium text-gray-700 mb-2">Welcome, {user.firstName || user.username}!</h2>
            <p className="text-gray-600">This is your central hub for all payroll activities.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-medium text-gray-700 mb-2">Quick Stats</h2>
            <p className="text-gray-600">Upcoming holidays: X</p>
            <p className="text-gray-600">Pending leave requests: Y</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-medium text-gray-700 mb-2">Recent Activity</h2>
            <p className="text-gray-600">- Payslip generated for May 2025</p>
            <p className="text-gray-600">- Attendance marked for 17 June 2025</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
