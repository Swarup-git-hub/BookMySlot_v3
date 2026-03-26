import { useState, useEffect } from 'react';
import { useToastStore } from '../../../store/toastStore.js';
import DataTable from '../../../components/ui/DataTable.jsx';
import { Search, Plus, Trash2, Edit, Calendar, Clock, Check, X } from 'lucide-react';
import apiClient from '../../../services/apiClient.js';

export default function SessionsManagement() {
  const toast = useToastStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    forenoon: { startTime: '09:00', endTime: '13:00', slotCount: 5 },
    afternoon: { startTime: '14:00', endTime: '18:00', slotCount: 5 },
    slotDuration: 30,
  });
  const [editingSession, setEditingSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = { search };
      const { data } = await apiClient.get('/api/admin/sessions', { params });
      setSessions(data.sessions || data);
    } catch (err) {
      toast.error('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSession = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingSession ? `/api/admin/sessions/${editingSession._id}` : '/api/admin/sessions';
      const method = editingSession ? 'PUT' : 'POST';
      
      await apiClient[method.toLowerCase()](endpoint, formData);
      toast.success(editingSession ? 'Session updated' : 'Session created');
      setShowForm(false);
      setFormData({
        date: '',
        forenoon: { startTime: '09:00', endTime: '13:00', slotCount: 5 },
        afternoon: { startTime: '14:00', endTime: '18:00', slotCount: 5 },
        slotDuration: 30,
      });
      setEditingSession(null);
      fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save session');
    }
  };

  const handleEdit = (session) => {
    setFormData({
      date: session.date.split('T')[0],
      forenoon: {
        startTime: session.configuration.forenoon.startTime,
        endTime: session.configuration.forenoon.endTime,
        slotCount: session.configuration.forenoon.slots,
      },
      afternoon: {
        startTime: session.configuration.afternoon.startTime,
        endTime: session.configuration.afternoon.endTime,
        slotCount: session.configuration.afternoon.slots,
      },
      slotDuration: session.configuration.slotDuration,
    });
    setEditingSession(session);
    setShowForm(true);
  };

  const handleDelete = async (sessionId) => {
    if (!confirm('Delete session? All slots will be removed.')) return;
    
    try {
      await apiClient.delete(`/api/admin/sessions/${sessionId}`);
      toast.success('Session deleted');
      fetchSessions();
    } catch (err) {
      toast.error('Failed to delete session');
    }
  };

  const handleGenerateSlots = async (sessionId) => {
    try {
      await apiClient.post(`/api/slots/session/${sessionId}/generate`);
      toast.success('Slots generated');
      fetchSessions();
    } catch (err) {
      toast.error('Failed to generate slots');
    }
  };

  const columns = [
    { key: 'date', header: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { 
      key: 'configuration', 
      header: 'Slots',
      render: (row) => (
        <div className="space-y-1 text-sm">
          <div>Forenoon: {row.configuration.forenoon.slots} slots</div>
          <div>Afternoon: {row.configuration.afternoon.slots} slots</div>
          <div>Duration: {row.configuration.slotDuration} min</div>
        </div>
      )
    },
    { 
      key: 'slotsGenerated', 
      header: 'Slots Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.slotsGenerated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {row.slotsGenerated ? 'Generated' : 'Pending'}
        </span>
      )
    },
    { 
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleEdit(row)} 
            className="p-1 text-blue-600 hover:text-blue-800"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => handleGenerateSlots(row._id)} 
            disabled={row.slotsGenerated}
            className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
          >
            <Check size={16} />
          </button>
          <button 
            onClick={() => handleDelete(row._id)} 
            className="p-1 text-red-600 hover:text-red-800"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Sessions Management</h1>
          <p className="text-slate-600 dark:text-slate-400">{sessions.length} sessions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
        >
          <Calendar size={20} />
          New Session
        </button>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search sessions..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchSessions();
          }}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* DataTable */}
      <DataTable
        data={sessions}
        columns={columns}
        loading={loading}
        onRefresh={fetchSessions}
      />

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              {editingSession ? 'Edit Session' : 'Create New Session'}
            </h2>
            <form onSubmit={handleSaveSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Slot Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.slotDuration}
                  onChange={(e) => setFormData({...formData, slotDuration: parseInt(e.target.value)})}
                  min="15"
                  max="60"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Forenoon</label>
                  <div className="space-y-2">
                    <input
                      type="time"
                      value={formData.forenoon.startTime}
                      onChange={(e) => setFormData({
                        ...formData, 
                        forenoon: {...formData.forenoon, startTime: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                    />
                    <input
                      type="time"
                      value={formData.forenoon.endTime}
                      onChange={(e) => setFormData({
                        ...formData, 
                        forenoon: {...formData.forenoon, endTime: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                    />
                    <input
                      type="number"
                      value={formData.forenoon.slotCount}
                      onChange={(e) => setFormData({
                        ...formData, 
                        forenoon: {...formData.forenoon, slotCount: parseInt(e.target.value)}
                      })}
                      placeholder="Slots"
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Afternoon</label>
                  <div className="space-y-2">
                    <input
                      type="time"
                      value={formData.afternoon.startTime}
                      onChange={(e) => setFormData({
                        ...formData, 
                        afternoon: {...formData.afternoon, startTime: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                    />
                    <input
                      type="time"
                      value={formData.afternoon.endTime}
                      onChange={(e) => setFormData({
                        ...formData, 
                        afternoon: {...formData.afternoon, endTime: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                    />
                    <input
                      type="number"
                      value={formData.afternoon.slotCount}
                      onChange={(e) => setFormData({
                        ...formData, 
                        afternoon: {...formData.afternoon, slotCount: parseInt(e.target.value)}
                      })}
                      placeholder="Slots"
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {editingSession ? 'Update Session' : 'Create Session'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      date: '',
                      forenoon: { startTime: '09:00', endTime: '13:00', slotCount: 5 },
                      afternoon: { startTime: '14:00', endTime: '18:00', slotCount: 5 },
                      slotDuration: 30,
                    });
                    setEditingSession(null);
                  }}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

