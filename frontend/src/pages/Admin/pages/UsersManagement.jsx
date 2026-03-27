import { useState, useEffect } from 'react';
import { useToastStore } from '../../../store/toastStore.js';
import DataTable from '../../../components/ui/DataTable.jsx';
import { Search, Plus, Trash2, Edit, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import apiClient from '../../../services/apiClient.js';

export default function UsersManagement() {
  const toast = useToastStore();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'student', team: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  // Auto-refresh search results
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      
      const { data } = await apiClient.get('/auth/users', { params });
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to fetch users: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data } = await apiClient.get('/teams');
      setTeams(data.teams || []);
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.role) errors.role = 'Role is required';
    if (formData.role === 'student' && !formData.team) errors.team = 'Team is required for students';

    // Check if email already exists (excluding edited user)
    const emailExists = users.some(u => u.email === formData.email && u._id !== editingUser?._id);
    if (emailExists) errors.email = 'Email already exists';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setSubmitting(true);
      const endpoint = editingUser ? `/auth/users/${editingUser._id}` : '/auth/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await apiClient[method.toLowerCase()](endpoint, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        ...(formData.role === 'student' && { team: formData.team })
      });

      toast.success(editingUser ? 'User updated successfully' : 'User created successfully');
      setShowForm(false);
      setFormData({ name: '', email: '', role: 'student', team: '' });
      setEditingUser(null);
      setFormErrors({});
      
      // Real-time update - add or update in list
      if (editingUser) {
        setUsers(users.map(u => u._id === editingUser._id ? response.user : u));
      } else {
        setUsers([response.user, ...users]);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error('Error saving user:', err);
      toast.error('Failed to save user: ' + errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      team: user.team?._id || ''
    });
    setEditingUser(user);
    setFormErrors({});
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      await apiClient.delete(`/auth/users/${userId}`);
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({ name: '', email: '', role: 'student', team: '' });
    setEditingUser(null);
    setFormErrors({});
  };

  const columns = [
    { key: 'name', header: 'Name', render: (fieldValue, fullRow) => fullRow ? fullRow.name : '—' },
    { key: 'email', header: 'Email', render: (fieldValue, fullRow) => fullRow ? fullRow.email : '—' },
    { 
      key: 'role', 
      header: 'Role', 
      render: (fieldValue, fullRow) => fullRow ? (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
          fullRow.role === 'admin' 
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
            : fullRow.role === 'guide' 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        }`}>
          {fullRow.role}
        </span>
      ) : <span className="text-slate-400">—</span>
    },
    { key: 'team', header: 'Team', render: (fieldValue, fullRow) => fullRow ? (fullRow.team?.name || <span className="text-slate-400">—</span>) : <span className="text-slate-400">—</span> },
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
            title="Edit user"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => handleDelete(fullRow._id)} 
            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
            title="Delete user"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : <span className="text-slate-400">—</span>
    }
  ];

  const studentTeams = teams.filter(t => !formData.role || formData.role === 'student');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Users Management</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Total: <span className="font-semibold">{users.length}</span> users
            {search && ` (${search})`}
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setFormData({ name: '', email: '', role: 'student', team: '' });
            setEditingUser(null);
            setFormErrors({});
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="guide">Guides</option>
          <option value="student">Students</option>
        </select>
      </div>

      {/* DataTable */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        onRefresh={fetchUsers}
        emptyMessage="No users found"
      />

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h2>
              <button 
                onClick={handleCloseForm}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddUser} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({...formData, name: e.target.value});
                    setFormErrors({...formErrors, name: ''});
                  }}
                  placeholder="Enter user name"
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

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    setFormErrors({...formErrors, email: ''});
                  }}
                  placeholder="Enter email address"
                  disabled={!!editingUser}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition ${
                    formErrors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                  } ${editingUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                {formErrors.email && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {formErrors.email}
                  </p>
                )}
              </div>

              {/* Role Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    setFormData({...formData, role: newRole, team: newRole === 'student' ? formData.team : ''});
                    setFormErrors({...formErrors, role: '', team: ''});
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition ${
                    formErrors.role ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  <option value="">Select Role</option>
                  <option value="student">Student</option>
                  <option value="guide">Guide</option>
                  <option value="admin">Admin</option>
                </select>
                {formErrors.role && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {formErrors.role}
                  </p>
                )}
              </div>

              {/* Team Field (Students Only) */}
              {formData.role === 'student' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Team *
                  </label>
                  <select
                    value={formData.team}
                    onChange={(e) => {
                      setFormData({...formData, team: e.target.value});
                      setFormErrors({...formErrors, team: ''});
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition ${
                      formErrors.team ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <option value="">Select Team</option>
                    {studentTeams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name} ({team.members?.length || 0}/{team.maxMembers})
                      </option>
                    ))}
                  </select>
                  {formErrors.team && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} /> {formErrors.team}
                    </p>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      {editingUser ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      {editingUser ? 'Update User' : 'Create User'}
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
                <strong>Tips:</strong> Students must be assigned to a team. Guides can manage multiple teams. After creation, users can log in with their email.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

