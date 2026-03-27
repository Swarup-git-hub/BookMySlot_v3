import { useState, useEffect } from 'react';
import { useToastStore } from '../../../store/toastStore.js';
import DataTable from '../../../components/ui/DataTable.jsx';
import { Search, Plus, Trash2, Edit, Users, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import apiClient from '../../../services/apiClient.js';

export default function TeamsManagement() {
  const toast = useToastStore();
  const [teams, setTeams] = useState([]);
  const [guides, setGuides] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', guideId: '', maxMembers: 5 });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchTeams();
    fetchGuides();
    fetchStudents();
  }, []);

  // Auto-refresh search results
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTeams();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      
      const { data } = await apiClient.get('/teams', { params });
      setTeams(data.teams || []);
    } catch (err) {
      console.error('Error fetching teams:', err);
      toast.error('Failed to fetch teams: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchGuides = async () => {
    try {
      const { data } = await apiClient.get('/auth/users', { params: { role: 'guide' } });
      setGuides(data.users || []);
    } catch (err) {
      console.error('Error fetching guides:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await apiClient.get('/auth/users', { params: { role: 'student' } });
      setStudents(data.users || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Team name is required';
    if (!formData.guideId) errors.guideId = 'Guide is required';
    if (!formData.maxMembers || formData.maxMembers < 1) errors.maxMembers = 'Max members must be at least 1';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setSubmitting(true);
      const endpoint = editingTeam ? `/teams/${editingTeam._id}` : '/teams';
      const method = editingTeam ? 'PATCH' : 'POST';
      
      const payload = {
        name: formData.name,
        guideId: formData.guideId,
        maxMembers: formData.maxMembers,
      };

      const response = await apiClient[method.toLowerCase()](endpoint, payload);
      const newTeamId = response.team?._id || editingTeam?._id;

      // Add selected students
      if (selectedStudents.length > 0 && newTeamId) {
        for (const studentId of selectedStudents) {
          try {
            await apiClient.post(`/teams/${newTeamId}/add-student`, { studentId });
          } catch (err) {
            console.error(`Failed to add student: ${err.message}`);
          }
        }
      }

      toast.success(editingTeam ? 'Team updated successfully' : 'Team created successfully');
      setShowForm(false);
      setFormData({ name: '', guideId: '', maxMembers: 5 });
      setSelectedStudents([]);
      setEditingTeam(null);
      setFormErrors({});
      
      // Real-time update
      fetchTeams();
      fetchStudents(); // Refresh student list since they may have been assigned
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error('Error saving team:', err);
      toast.error('Failed to save team: ' + errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (team) => {
    setFormData({
      name: team.name,
      guideId: team.guide?._id || '',
      maxMembers: team.maxMembers || 5,
    });
    setSelectedStudents(team.members?.map(m => m._id) || []);
    setEditingTeam(team);
    setFormErrors({});
    setShowForm(true);
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team? Students will be unassigned.')) return;
    
    try {
      await apiClient.delete(`/teams/${teamId}`);
      toast.success('Team deleted successfully');
      setTeams(teams.filter(t => t._id !== teamId));
      fetchStudents();
    } catch (err) {
      console.error('Error deleting team:', err);
      toast.error('Failed to delete team: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({ name: '', guideId: '', maxMembers: 5 });
    setSelectedStudents([]);
    setEditingTeam(null);
    setFormErrors({});
  };

  const toggleStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Get unassigned students
  const unassignedStudents = students.filter(s => !s.team);
  const currentStudents = selectedStudents.map(id => students.find(s => s._id === id)).filter(Boolean);

  const columns = [
    { key: 'name', header: 'Team Name', render: (fieldValue, fullRow) => fullRow ? <span className="font-semibold">{fullRow.name}</span> : <span className="text-slate-400">—</span> },
    { key: 'guide', header: 'Guide', render: (fieldValue, fullRow) => fullRow ? (fullRow.guide?.name || 'N/A') : <span className="text-slate-400">—</span> },
    { 
      key: 'members', 
      header: 'Members', 
      render: (fieldValue, fullRow) => fullRow ? (
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold">
          {fullRow.members?.length || 0}/{fullRow.maxMembers}
        </span>
      ) : <span className="text-slate-400">—</span>
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (fieldValue, fullRow) => fullRow ? (
        <span className={`text-xs font-semibold ${fullRow.isActive ? 'text-green-600' : 'text-red-600'}`}>
          {fullRow.isActive ? 'Active' : 'Inactive'}
        </span>
      ) : <span className="text-slate-400">—</span>
    },
    { 
      key: 'actions',
      header: 'Actions',
      render: (fieldValue, fullRow) => fullRow ? (
        <div className="flex gap-2">
          <button 
            onClick={() => handleEdit(fullRow)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
            title="Edit team"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => handleDelete(fullRow._id)}
            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
            title="Delete team"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : <span className="text-slate-400">—</span>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Teams Management</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Total: <span className="font-semibold">{teams.length}</span> teams
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setFormData({ name: '', guideId: '', maxMembers: 5 });
            setSelectedStudents([]);
            setEditingTeam(null);
            setFormErrors({});
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          Create Team
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search teams by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      {/* DataTable */}
      <DataTable
        data={teams}
        columns={columns}
        loading={loading}
        onRefresh={fetchTeams}
        emptyMessage="No teams found"
      />

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingTeam ? 'Edit Team' : 'Create New Team'}
              </h2>
              <button 
                onClick={handleCloseForm}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveTeam} className="space-y-6">
              {/* Team Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Team Details</h3>
                
                {/* Team Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({...formData, name: e.target.value});
                      setFormErrors({...formErrors, name: ''});
                    }}
                    placeholder="e.g., Team A, Group 1"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition ${
                      formErrors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} /> {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Guide Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Guide *
                  </label>
                  <select
                    value={formData.guideId}
                    onChange={(e) => {
                      setFormData({...formData, guideId: e.target.value});
                      setFormErrors({...formErrors, guideId: ''});
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition ${
                      formErrors.guideId ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <option value="">Select a Guide</option>
                    {guides.map((guide) => (
                      <option key={guide._id} value={guide._id}>
                        {guide.name} ({guide.email})
                      </option>
                    ))}
                  </select>
                  {formErrors.guideId && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} /> {formErrors.guideId}
                    </p>
                  )}
                </div>

                {/* Max Members */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Max Members *
                  </label>
                  <input
                    type="number"
                    value={formData.maxMembers}
                    onChange={(e) => {
                      setFormData({...formData, maxMembers: parseInt(e.target.value) || 1});
                      setFormErrors({...formErrors, maxMembers: ''});
                    }}
                    min="1"
                    max="10"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition ${
                      formErrors.maxMembers ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  />
                  {formErrors.maxMembers && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} /> {formErrors.maxMembers}
                    </p>
                  )}
                </div>
              </div>

              {/* Student Selection */}
              <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Assign Students ({selectedStudents.length}/{formData.maxMembers})
                </h3>
                
                {selectedStudents.length >= formData.maxMembers && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      <AlertCircle size={14} className="inline mr-2" />
                      Team is at maximum capacity
                    </p>
                  </div>
                )}

                {/* Current Members */}
                {selectedStudents.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 space-y-2">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Selected Students:</p>
                    <div className="space-y-2">
                      {currentStudents.map((student) => (
                        <div
                          key={student._id}
                          className="flex items-center justify-between bg-white dark:bg-slate-700 p-2 rounded border border-slate-200 dark:border-slate-600"
                        >
                          <span className="text-sm">{student.name}</span>
                          <button
                            type="button"
                            onClick={() => toggleStudent(student._id)}
                            className="text-red-600 hover:text-red-700 font-semibold text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Students */}
                {unassignedStudents.length > 0 && selectedStudents.length < formData.maxMembers && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Available Students:</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {unassignedStudents.map((student) => (
                        <label
                          key={student._id}
                          className="flex items-center p-2 rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student._id)}
                            onChange={(e) => {
                              if (e.target.checked && selectedStudents.length < formData.maxMembers) {
                                toggleStudent(student._id);
                              } else if (!e.target.checked) {
                                toggleStudent(student._id);
                              }
                            }}
                            disabled={selectedStudents.length >= formData.maxMembers && !selectedStudents.includes(student._id)}
                            className="rounded"
                          />
                          <span className="ml-3 text-sm flex-1">{student.name}</span>
                          <span className="text-xs text-slate-500">{student.email}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {unassignedStudents.length === 0 && selectedStudents.length === 0 && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">No available students to assign</p>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      {editingTeam ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      {editingTeam ? 'Update Team' : 'Create Team'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={submitting}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-semibold py-2.5 px-4 rounded-lg transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Helper Text */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Tips:</strong> Create teams with a guide and assign 4-5 students per team. You can later edit teams to add or remove students. Each guide can manage multiple teams.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

