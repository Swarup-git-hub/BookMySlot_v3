import { useState, useEffect } from 'react';
import { useToastStore } from '../../store/toastStore.js';
import DataTable from '../../components/ui/DataTable.jsx';
import { CheckCircle, XCircle, Clock, Calendar, Clock8 } from 'lucide-react';
import apiClient from '../../services/apiClient.js';

export default function PendingRequests() {
  const toast = useToastStore();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/api/requests/guide/all?status=pending');
      setRequests(data.requests || []);
    } catch (err) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!confirm('Approve this request? Competing requests will be auto-rejected.')) return;
    
    try {
      await apiClient.post(`/api/requests/${requestId}/approve`);
      toast.success('Request approved');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Approval failed');
    }
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    try {
      await apiClient.post(`/api/requests/${selectedRequest._id}/reject`, { reason: rejectReason });
      toast.success('Request rejected');
      setShowRejectModal(false);
      fetchRequests();
    } catch (err) {
      toast.error('Reject failed');
    }
  };

  const columns = [
    { 
      key: 'student', 
      header: 'Student',
      render: (row) => (
        <div>
          <p className="font-semibold">{row.student?.name}</p>
          <p className="text-sm text-slate-500">{row.student?.email}</p>
        </div>
      )
    },
    { 
      key: 'slot',
      header: 'Slot',
      render: (row) => (
        <div>
          <p className="font-semibold">{row.slot?.startTime} - {row.slot?.endTime}</p>
          <p className="text-sm capitalize">{row.slot?.period}</p>
        </div>
      )
    },
    { key: 'session', header: 'Date', render: (row) => new Date(row.session.date).toLocaleDateString() },
    { 
      key: 'status', 
      header: 'Status',
      render: (row) => (
        <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 font-semibold">
          Pending
        </span>
      )
    },
    { 
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleApprove(row._id)}
            className="p-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition"
            title="Approve"
          >
            <CheckCircle size={18} />
          </button>
          <button 
            onClick={() => handleReject(row)}
            className="p-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition"
            title="Reject"
          >
            <XCircle size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Pending Requests</h1>
          <p className="text-slate-600 dark:text-slate-400">{requests.length} pending</p>
        </div>
      </div>

      <DataTable
        data={requests}
        columns={columns}
        loading={loading}
        onRefresh={fetchRequests}
      />

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Reject Request</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              <strong>{selectedRequest.student?.name}</strong> - {selectedRequest.slot?.startTime}
            </p>
            <div className="space-y-4">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows="3"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-slate-700"
              />
              <div className="flex gap-3">
                <button
                  onClick={confirmReject}
                  disabled={!rejectReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

