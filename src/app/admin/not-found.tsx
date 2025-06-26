'use client';

import AppLayout from '@/app/AppLayout';
import NotFoundComponent from '@/components/NotFoundComponent';

export default function AdminNotFound() {
  return (
    <AppLayout>
      <NotFoundComponent
        title='Admin Page Not Found'
        description="The admin page you're looking for doesn't exist. Please check the URL or contact the system administrator."
      />
    </AppLayout>
  );
}
