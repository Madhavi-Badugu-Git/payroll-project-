'use client';

import { useState, useMemo } from 'react'; // Removed unused useEffect
import AppLayout from '../AppLayout';
import initialLeaveDataJson from './leaves-data.json'; // Renamed for clarity
import { useUser } from '@clerk/nextjs';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface LeaveEntry {
  id: string;
  userId: string;
  leaveType: 'Earned Leave' | 'Sick Leave' | 'Casual Leave' | 'Unpaid Leave';
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  noOfDays: number;
  reason: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected' | 'Cancelled';
  approvedBy?: string;
  appliedDate: string; // YYYY-MM-DD
  lastModifiedDate?: string; // YYYY-MM-DD
}

const LEAVE_TYPES: LeaveEntry['leaveType'][] = ['Earned Leave', 'Sick Leave', 'Casual Leave', 'Unpaid Leave'];
const LEAVES_PER_MONTH = 2;
const CURRENT_YEAR = new Date().getFullYear();

// Assuming leaves-data.json is an object like { "leaves": [...] }
// Or if it's directly an array, this will also work but might show a type error if not handled by `as`
const actualInitialLeaveData = (initialLeaveDataJson as any).leaves || initialLeaveDataJson;

export default function LeavesPage() {
  const { user } = useUser();
  const [leaves, setLeaves] = useState<LeaveEntry[]>((actualInitialLeaveData || []) as LeaveEntry[]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveEntry | null>(null);
  const [formData, setFormData] = useState<Partial<LeaveEntry>>({});
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [leaveToDeleteId, setLeaveToDeleteId] = useState<string | null>(null);

  const userLeaves = useMemo(() => {
    if (!user) return [];
    return leaves.filter(leave => leave.userId === user.id).sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
  }, [leaves, user]);

  const calculateAvailableLeaves = () => {
    if (!user) return { earned: 0, sick: 0, casual: 0, totalAvailable: 0, totalUsed: 0, totalSanctioned: 0 };

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11
    // Leaves are sanctioned at the end of the month, so for current month, they are not yet sanctioned unless it's the last day.
    // For simplicity, we'll consider leaves sanctioned for all past months of the current year.
    // And for the current month if we are past a certain day (e.g. 25th) or just count previous months.
    // Let's assume leaves are credited for completed months.
    const completedMonths = currentMonth; // Fixed: let to const
    // If we want to be more precise: if today is end of month, completedMonths = currentMonth + 1.

    const totalSanctioned = completedMonths * LEAVES_PER_MONTH;

    const usedLeaves = userLeaves
      .filter(leave => leave.status === 'Approved' && new Date(leave.fromDate).getFullYear() === CURRENT_YEAR)
      .reduce((acc, leave) => acc + leave.noOfDays, 0);
    
    const available = totalSanctioned - usedLeaves;

    // This is a simplified model. A real system would track different leave types separately.
    // For now, we'll just show a general pool based on 'Earned Leave' concept.
    return {
      earned: Math.max(0, available), // Assuming all sanctioned are 'Earned'
      sick: 0, // Placeholder, sick leaves might have different rules
      casual: 0, // Placeholder
      totalAvailable: Math.max(0, available),
      totalUsed: usedLeaves,
      totalSanctioned,
    };
  };

  const availableLeaves = useMemo(calculateAvailableLeaves, [userLeaves, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    if (newFormData.fromDate && newFormData.toDate) {
      const from = new Date(newFormData.fromDate);
      const to = new Date(newFormData.toDate);
      if (to >= from) {
        const diffTime = Math.abs(to.getTime() - from.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive of start and end date
        newFormData = { ...newFormData, noOfDays: diffDays };
      } else {
        newFormData = { ...newFormData, noOfDays: 0 }; // Or show an error
      }
    }
    setFormData(newFormData);
  };

  const openModal = (leave: LeaveEntry | null = null) => {
    if (leave) {
      setEditingLeave(leave);
      setFormData({
        leaveType: leave.leaveType,
        fromDate: leave.fromDate,
        toDate: leave.toDate,
        noOfDays: leave.noOfDays,
        reason: leave.reason,
      });
    } else {
      setEditingLeave(null);
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        leaveType: 'Earned Leave',
        fromDate: today,
        toDate: today,
        noOfDays: 1,
        reason: '',
        status: 'Pending Approval',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLeave(null);
    setFormData({});
  };

  const openDeleteConfirm = (id: string) => {
    setLeaveToDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setLeaveToDeleteId(null);
    setIsDeleteConfirmOpen(false);
  };

  const confirmDelete = () => {
    if (leaveToDeleteId) {
      setLeaves(prev => prev.filter(l => l.id !== leaveToDeleteId));
    }
    closeDeleteConfirm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.leaveType || !formData.fromDate || !formData.toDate || !formData.noOfDays || formData.noOfDays <= 0) {
      alert('Please fill all required fields and ensure number of days is positive.');
      return;
    }

    const newLeaveRequest: LeaveEntry = {
      id: editingLeave ? editingLeave.id : `L${Date.now()}`,
      userId: user.id,
      leaveType: formData.leaveType as LeaveEntry['leaveType'],
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      noOfDays: Number(formData.noOfDays),
      reason: formData.reason || '',
      status: editingLeave ? (editingLeave.status === 'Pending Approval' ? 'Pending Approval' : editingLeave.status) : 'Pending Approval',
      appliedDate: editingLeave ? editingLeave.appliedDate : new Date().toISOString().split('T')[0],
      lastModifiedDate: new Date().toISOString().split('T')[0],
      ...(editingLeave && editingLeave.approvedBy && { approvedBy: editingLeave.approvedBy }),
    };

    if (editingLeave) {
      setLeaves(prev => prev.map(l => l.id === editingLeave.id ? newLeaveRequest : l));
    } else {
      setLeaves(prev => [newLeaveRequest, ...prev]);
    }
    closeModal();
  };

  const handleDelete = (leaveId: string) => {
    // if (window.confirm('Are you sure you want to delete this leave request?')) {
    //   setLeaves(prev => prev.filter(l => l.id !== leaveId));
    // }
    openDeleteConfirm(leaveId); // Open custom confirmation dialog
  };
  
  const getStatusColor = (status: LeaveEntry['status']) => {
    switch (status) {
      case 'Approved': return 'text-green-600 dark:text-green-400';
      case 'Pending Approval': return 'text-yellow-600 dark:text-yellow-400';
      case 'Rejected': return 'text-red-600 dark:text-red-400';
      case 'Cancelled': return 'text-gray-500 dark:text-gray-400';
      default: return '';
    }
  };

  if (!user) {
    return <AppLayout><div className="p-6">Please sign in to manage your leaves.</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Manage Leaves</h1>
          <button
            onClick={() => openModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md flex items-center transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Apply for Leave
          </button>
        </div>

        {/* Leave Balance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sanctioned ({CURRENT_YEAR})</h3>
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{availableLeaves.totalSanctioned}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Used ({CURRENT_YEAR})</h3>
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{availableLeaves.totalUsed}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Balance</h3>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{availableLeaves.totalAvailable}</p>
          </div>
           {/* Add more specific leave type balances if needed */}
        </div>

        {/* Leaves Table */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Leave Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">From Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">To Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No. of Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Approved By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Applied On</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {userLeaves.map((leave) => (
                <tr key={leave.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{leave.leaveType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(leave.fromDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(leave.toDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{leave.noOfDays}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 truncate max-w-xs" title={leave.reason}>{leave.reason}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getStatusColor(leave.status)}`}>{leave.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{leave.approvedBy || '--'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(leave.appliedDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {(leave.status === 'Pending Approval' || leave.status === 'Cancelled') && (
                      <button onClick={() => openModal(leave)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-3">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}
                    {(leave.status === 'Pending Approval' || leave.status === 'Approved') && (
                       <button onClick={() => handleDelete(leave.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">
                         <TrashIcon className="h-5 w-5" />
                       </button>
                    )}
                  </td>
                </tr>
              ))}
              {userLeaves.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">No leave records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal for Add/Edit Leave */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-40 flex items-center justify-center">
            <div className="relative bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">{editingLeave ? 'Edit' : 'Apply for'} Leave</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Leave Type</label>
                  <select 
                    name="leaveType" 
                    id="leaveType" 
                    value={formData.leaveType || ''} 
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  >
                    {LEAVE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">From Date</label>
                    <input 
                      type="date" 
                      name="fromDate" 
                      id="fromDate" 
                      value={formData.fromDate || ''} 
                      onChange={handleDateChange} 
                      required 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
                    <input 
                      type="date" 
                      name="toDate" 
                      id="toDate" 
                      value={formData.toDate || ''} 
                      onChange={handleDateChange} 
                      required 
                      min={formData.fromDate} // Ensure toDate is not before fromDate
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="noOfDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number of Days</label>
                  <input 
                    type="number" 
                    name="noOfDays" 
                    id="noOfDays" 
                    value={formData.noOfDays || ''} 
                    readOnly // Calculated automatically
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                  <textarea 
                    name="reason" 
                    id="reason" 
                    rows={3} 
                    value={formData.reason || ''} 
                    onChange={handleInputChange} 
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex items-center justify-end space-x-4">
                  <button 
                    type="button" 
                    onClick={closeModal} 
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {editingLeave ? 'Update Leave' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Confirm Deletion</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this leave request? This action cannot be undone.</p>
              <div className="flex items-center justify-end space-x-4">
                <button 
                  type="button" 
                  onClick={closeDeleteConfirm} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={confirmDelete} 
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
