import { useState, useEffect } from 'react';
import { useToastStore } from '../../store/toastStore.js';
import DataTable from '../../components/ui/DataTable.jsx';
import { Search, Plus, UserPlus, Download, Users } from 'lucide-react';
import apiClient from '../../services/apiClient.js';

export default function MyTeams() {
  const toast = useToastStore();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/teams/guide/teams');
      setTeams(data.teams || []);
    } catch (err) {
      toast.error('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const { data } = await apiClient.get('/api/auth/users?role=student');
      setAvailableStudents(data.users || []);
    } catch (err) {
      console.error('Failed to fetch students');
    }
  };

  const handleExportTeam = async (teamId) => {
    try {
      const link = document.createElement('a');
      link.href = `/api/export/team/${teamId}/excel`;
      link.download = `team-${teamId}.xlsx`;
      link.click();
      toast.success('Team bookings exported');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const handleAddStudentToTeam = async (teamId) => {
    setSelectedTeam(teams.find(t => t._id === teamId));
    setShowAddStudent(true);
    await fetchAvailableStudents();
  };

  const columns = [
    { key: 'name', header: 'Team Name', render: (row) => row.name },
    { 
      key: 'members', 
      header: 'Members',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Users size={16} />
          <span>{row.members?.length || 0}/{row.maxMembers}</span>
        </div>
      )
    },
{ key: 'bookings', header: 'Bookings', render: (row) => 0 },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleAddStudentToTeam(row._id)}
            className="p-1 text-green-600 hover:text-green-800"
          >
            <UserPlus size={16} />
          </button>
          <button 
            onClick={() => handleExportTeam(row._id)}
            className="p-1 text-blue-600 hover:text-blue-800"
          >
            <Download size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Teams</h1>
          <p className="text-slate-600 dark:text-slate-400">{teams.length} teams</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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

      {/* Add Student Modal */}
      {showAddStudent && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Add Students to {selectedTeam.name}</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {availableStudents.map((student) => (
                <label key={student._id} className="flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{student.name} ({student.email})</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg">
                Add Selected
              </button>
              <button 
                onClick={() => setShowAddStudent(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

