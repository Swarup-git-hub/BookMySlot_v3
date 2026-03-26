import { useState } from 'react';
import { useToastStore } from '../../store/toastStore.js';
import DataTable from '../../components/ui/DataTable.jsx';
import { Download, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import apiClient from '../../services/apiClient.js';

export default function TeamBookings() {
  const toast = useToastStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamFilter, setTeamFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = { team: teamFilter, date: dateFilter };
      const { data } = await apiClient.get('/api/teams/guide/bookings', { params });
      setBookings(data.bookings || []);
    } catch (err) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const url = `/api/export/team-bookings/${format}?team=${teamFilter || 'all'}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = `team-bookings-${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
      toast.success('Bookings exported');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const columns = [
    { key: 'student', header: 'Student', render: (row) => row.studentName },
    { key: 'team', header: 'Team', render: (row) => row.teamName },
    { key: 'session', header: 'Session Date', render: (row) => new Date(row.sessionDate).toLocaleDateString() },
    { key: 'slot', header: 'Time', render: (row) => `${row.slotStartTime} - ${row.slotEndTime}` },
    { 
      key: 'status', 
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
          row.status === 'approved' ? 'bg-green-100 text-green-800' :
          row.status === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.status}
        </span>
      )
    },
    { 
      key: 'guideAction', 
      header: 'Approved By',
      render: (row) => row.approvedByName || 'Pending'
    },
    { key: 'requestDate', header: 'Requested', render: (row) => new Date(row.createdAt).toLocaleDateString() }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Team Bookings</h1>
          <p className="text-slate-600 dark:text-slate-400">Booking history for your teams</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-1"
          >
            <Download size={16} />
            CSV
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-1"
          >
            <Download size={16} />
            Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Filter by team..."
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700"
          />
        </div>
        <div className="relative">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700"
          />
        </div>
        <button
          onClick={fetchBookings}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
        >

<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.414a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
</svg>

          Filter
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        data={bookings}
        columns={columns}
        loading={loading}
        onRefresh={fetchBookings}
        enableFilters={true}
      />
    </div>
  );
}

