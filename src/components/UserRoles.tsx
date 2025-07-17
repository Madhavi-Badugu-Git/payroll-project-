'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface Role {
  id: string;
  roleName: string;
  description: string;
}

export default function UserRoles() {
  const { data: session } = useSession();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoles() {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/roles?action=getUserRoles&userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setRoles(data.roles);
        } else {
          setError('Failed to fetch roles');
        }
      } catch (_err) {
        setError('Error fetching roles');
      } finally {
        setLoading(false);
      }
    }

    fetchRoles();
  }, [session]);

  if (!session) {
    return <div className='p-4 text-gray-600'>Please sign in to view your roles</div>;
  }

  if (loading) {
    return <div className='p-4'>Loading roles...</div>;
  }

  if (error) {
    return <div className='p-4 text-red-600'>{error}</div>;
  }

  return (
    <div className='p-6 bg-white rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold mb-4'>Your Roles</h2>
      <div className='mb-4'>
        <p className='text-gray-600'>User: {session.user.email}</p>
        {session.user.employee && (
          <p className='text-gray-600'>Employee ID: {session.user.employee.id}</p>
        )}
      </div>

      {roles.length > 0 ? (
        <div className='space-y-3'>
          {roles.map(role => (
            <div key={role.id} className='p-3 border rounded-md'>
              <div className='flex items-center justify-between'>
                <span className='font-semibold text-blue-600'>{role.roleName}</span>
                <span className='px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded'>
                  {role.roleName.toUpperCase()}
                </span>
              </div>
              {role.description && <p className='text-gray-600 text-sm mt-1'>{role.description}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className='text-gray-600'>No roles assigned</p>
      )}
    </div>
  );
}
