import { useState, useEffect } from 'react';
import { useToastStore } from '../../../store/toastStore.js';
import DataTable from '../../../components/ui/DataTable.jsx';
import { Search, Plus, Trash2, Edit, Users, UserPlus } from 'lucide-react';
import apiClient from '../../../services/apiClient.js';

export default function TeamsManagement() {
  const toast = useToastStore();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', guide: '', maxMembers: 5 });
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);

  useEffect(() => {
    fetchTeams();
    fetchStudents();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const params = { search };
      const { data } = await apiClient.get('/api/teams', { params });
      setTeams(data.teams || data);
    } catch (err) {
      toast.error('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await apiClient.get('/api/auth/users?role=student');
      setAvailableStudents(data.users || []);
    } catch (err) {
      console.error('Failed to fetch students');
    }
  };

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingTeam ? `/api/teams/${editingTeam._id}` : '/api/teams';
      const method = editingTeam ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        members: selectedStudents,
      };

      await apiClient[method.toLowerCase()](endpoint, payload);
      toast.success(editingTeam ? 'Team updated' : 'Team created');
      setShowForm(false);
      setFormData({ name: '', guide: '', maxMembers: 5 });
      setSelectedStudents([]);
      setEditingTeam(null);
      fetchTeams();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save team');
    }
  };

  const handleEdit = (team) => {
    setFormData({
      name: team.name,
      guide: team.guide._id || '',
      maxMembers: team.maxMembers || 5,
    });
    setSelectedStudents(team.members || []);
    setEditingTeam(team);
    setShowForm(true);
  };

  const handleDelete = async (teamId) => {
    if (!confirm('Delete team and reassign students?')) return;
    
    try {
      await apiClient.delete(`/api/teams/${teamId}`);
      toast.success('Team deleted');
      fetchTeams();
    } catch (err) {
      toast.error('Failed to delete team');
    }
  };

  const toggleStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const columns = [
    { key: 'name', header: 'Team Name', render: (row) => row.name },
    { key: 'guide', header: 'Guide', render: (row) => row.guide?.name || 'N/A' },
    { key: 'members', header: 'Members', render: (row) => row.members?.length || 0 },
    { key: 'maxMembers', header: 'Max Size', render: (row) => row.maxMembers },
    { 
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row)} className="p-1 text-blue-600 hover:text-blue-800">
            <Edit size={16} />
          </button>
          <button onClick={() => handleDelete(row._id)} className="p-1 text-red-600 hover:text-red-800">
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Teams Management</h1>
          <p className="text-slate-600 dark:text-slate-400">{teams.length} teams</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
        >
          <Users size={20} />
          Add Team
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchTeams();
          }}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* DataTable */}
      <DataTable
        data={teams}
        columns={columns}
        loading={loading}
        onRefresh={fetchTeams}
      />

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              {editingTeam ? 'Edit Team' : 'Create New Team'}
            </h2>
            <form onSubmit={handleSaveTeam} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Team Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Max Members</label>
                  <input
                    type="number"
                    value={formData.maxMembers}
                    onChange={(e) => setFormData({...formData, maxMembers: parseInt(e.target.value)})}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Guide</label>
                <select
                  value={formData.guide}
                  onChange={(e) => setFormData({...formData, guide: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                >
                  <option value="">Select Guide</option>
                  {/* Note: Load guides from /api/auth/users?role=guide */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Members ({selectedStudents.length})</label>
                <div className="border border-slate-300 dark:border-slate-600 rounded-lg p-4 max-h-40 overflow-y-auto bg-slate-50 dark:bg-slate-700">
                  {availableStudents.map((student) => (
                    <label key={student._id} className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => toggleStudent(student._id)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">{student.name} - {student.email}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {editingTeam ? 'Update Team' : 'Create Team'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: '', guide: '', maxMembers: 5 });
                    setSelectedStudents([]);
                    setEditingTeam(null);
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

