import { useState, useEffect } from 'react';
import { useToastStore } from '../../../store/toastStore.js';
import DataTable from '../../../components/ui/DataTable.jsx';
import { Search, Plus, Trash2, Edit, Calendar, Clock, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '../../../services/apiClient.js';

export default function SessionsManagement() {
  const toast = useToastStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
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
      const { data } = await apiClient.get('/admin/sessions', { params });
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
      const endpoint = editingSession ? `/admin/sessions/${editingSession._id}` : '/admin/sessions';
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
      await apiClient.delete(`/admin/sessions/${sessionId}`);
      toast.success('Session deleted');
      fetchSessions();
    } catch (err) {
      toast.error('Failed to delete session');
    }
  };

  const handleGenerateSlots = async (sessionId) => {
    try {
      await apiClient.post(`/slots/session/${sessionId}/generate`);
      toast.success('Slots generated');
      fetchSessions();
    } catch (err) {
      toast.error('Failed to generate slots');
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const getSessionsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return sessions.filter(s => s.date.split('T')[0] === dateStr);
  };

  // Generate calendar for a specific month
  const generateCalendarDays = (monthDate) => {
    const daysInMonth = getDaysInMonth(monthDate);
    const firstDay = getFirstDayOfMonth(monthDate);
    const calendarDays = [];
    
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(i);
    }
    return calendarDays;
  };

  const columns = [
    { key: 'date', header: 'Date', render: (fieldValue, fullRow) => fullRow ? new Date(fullRow.date).toLocaleDateString() : '—' },
    { 
      key: 'configuration', 
      header: 'Session Times',
      render: (fieldValue, fullRow) => fullRow ? (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Clock size={14} />
            <span>Forenoon: {fullRow.configuration.forenoon.startTime}-{fullRow.configuration.forenoon.endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Clock size={14} />
            <span>Afternoon: {fullRow.configuration.afternoon.startTime}-{fullRow.configuration.afternoon.endTime}</span>
          </div>
        </div>
      ) : <span className="text-slate-400">—</span>
    },
    { 
      key: 'configuration', 
      header: 'Slots',
      render: (fieldValue, fullRow) => fullRow ? (
        <div className="space-y-1 text-sm">
          <div>Forenoon: <span className="font-semibold text-amber-600">{fullRow.configuration.forenoon.slots}</span> slots</div>
          <div>Afternoon: <span className="font-semibold text-blue-600">{fullRow.configuration.afternoon.slots}</span> slots</div>
          <div className="text-slate-500">Duration: {fullRow.configuration.slotDuration} min</div>
        </div>
      ) : <span className="text-slate-400">—</span>
    },
    { 
      key: 'slotsGenerated', 
      header: 'Status',
      render: (fieldValue, fullRow) => fullRow ? (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${fullRow.slotsGenerated ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
          {fullRow.slotsGenerated ? (<><Check size={12} /> Generated</>) : (<><X size={12} /> Pending</>)}
        </span>
      ) : <span className="text-slate-400">—</span>
    },
    { 
      key: 'actions',
      header: 'Actions',
      render: (fieldValue, fullRow) => fullRow ? (
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => handleEdit(fullRow)} 
            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => handleGenerateSlots(fullRow._id)} 
            disabled={fullRow.slotsGenerated}
            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Generate Slots"
          >
            <Check size={16} />
          </button>
          <button 
            onClick={() => handleDelete(fullRow._id)} 
            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
            title="Delete"
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Sessions Management</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Total: <span className="font-semibold">{sessions.length}</span> sessions
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              date: '',
              forenoon: { startTime: '09:00', endTime: '13:00', slotCount: 5 },
              afternoon: { startTime: '14:00', endTime: '18:00', slotCount: 5 },
              slotDuration: 30,
            });
            setEditingSession(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          Create Session
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search sessions by date..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchSessions();
          }}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 border border-slate-200 dark:border-slate-700 sticky top-6">
            {/* Month Navigation */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Jump to:</div>
              <select
                onChange={(e) => {
                  const month = parseInt(e.target.value);
                  setCurrentMonth(new Date(currentMonth.getFullYear(), month, 1));
                }}
                value={currentMonth.getMonth()}
                className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, idx) => (
                  <option key={month} value={idx}>{month}</option>
                ))}
              </select>
            </div>

            {/* Quick Navigation */}
            <div className="mb-4">
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="w-full px-3 py-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition font-semibold"
              >
                Current Month
              </button>
            </div>

            {/* Legend */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Legend:</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 dark:bg-green-900 rounded border border-green-400"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Session</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-blue-600 rounded"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-100 dark:bg-slate-700 rounded"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Single Month Calendar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                title="Previous month"
              >
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center flex-1">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                title="Next month"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-slate-600 dark:text-slate-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {(() => {
                const calendarDays = generateCalendarDays(currentMonth);
                return calendarDays.map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} className="aspect-square"></div>;
                  }

                  const dateForDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const sessionsForDay = getSessionsForDate(dateForDay);
                  const hasSession = sessionsForDay.length > 0;
                  const isToday = day === new Date().getDate() && 
                                currentMonth.getMonth() === new Date().getMonth() &&
                                currentMonth.getFullYear() === new Date().getFullYear();
                  const isPast = dateForDay < new Date() && !isToday;

                  return (
                    <button
                      key={`day-${day}`}
                      onClick={() => {
                        if (!isPast && !hasSession) {
                          setFormData({
                            ...formData,
                            date: dateForDay.toISOString().split('T')[0]
                          });
                          setEditingSession(null);
                          setShowForm(true);
                        }
                      }}
                      disabled={isPast && !isToday}
                      className={`aspect-square flex items-center justify-center text-sm font-semibold rounded-lg transition cursor-pointer relative ${
                        hasSession
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                          : isToday
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-2 border-blue-600'
                          : isPast
                          ? 'bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                      }`}
                      title={hasSession ? `${sessionsForDay.length} session(s)` : 'Create session'}
                    >
                      <span>{day}</span>
                      {hasSession && <div className="absolute bottom-1 w-1.5 h-1.5 bg-current rounded-full"></div>}
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List Section */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">📋 All Sessions</h2>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-slate-500">Loading sessions...</div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-12 text-center border border-slate-200 dark:border-slate-700">
            <Calendar size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-600 dark:text-slate-400">No sessions scheduled yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Use the calendar above to create new sessions</p>
          </div>
        ) : (
          <DataTable
            data={sessions}
            columns={columns}
            loading={false}
            onRefresh={fetchSessions}
          />
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {editingSession ? '✏️ Edit Session' : '📅 Create New Session'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {editingSession ? 'Update session details' : 'Schedule a new review session'}
                </p>
              </div>
              <button
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
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <X size={24} className="text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  📆 Session Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Slot Duration */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  ⏱️ Slot Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.slotDuration}
                  onChange={(e) => setFormData({...formData, slotDuration: parseInt(e.target.value)})}
                  min="15"
                  max="60"
                  step="15"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Forenoon and Afternoon Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Forenoon */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-700 rounded-lg p-4 border border-amber-200 dark:border-slate-600">
                  <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    Forenoon Session
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={formData.forenoon.startTime}
                        onChange={(e) => setFormData({
                          ...formData, 
                          forenoon: {...formData.forenoon, startTime: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                      <input
                        type="time"
                        value={formData.forenoon.endTime}
                        onChange={(e) => setFormData({
                          ...formData, 
                          forenoon: {...formData.forenoon, endTime: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Number of Slots</label>
                      <input
                        type="number"
                        value={formData.forenoon.slotCount}
                        onChange={(e) => setFormData({
                          ...formData, 
                          forenoon: {...formData.forenoon, slotCount: parseInt(e.target.value)}
                        })}
                        min="1"
                        max="10"
                        className="w-full px-3 py-2 border border-amber-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Afternoon */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-700 dark:to-slate-700 rounded-lg p-4 border border-blue-200 dark:border-slate-600">
                  <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Afternoon Session
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={formData.afternoon.startTime}
                        onChange={(e) => setFormData({
                          ...formData, 
                          afternoon: {...formData.afternoon, startTime: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-blue-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                      <input
                        type="time"
                        value={formData.afternoon.endTime}
                        onChange={(e) => setFormData({
                          ...formData, 
                          afternoon: {...formData.afternoon, endTime: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-blue-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Number of Slots</label>
                      <input
                        type="number"
                        value={formData.afternoon.slotCount}
                        onChange={(e) => setFormData({
                          ...formData, 
                          afternoon: {...formData.afternoon, slotCount: parseInt(e.target.value)}
                        })}
                        min="1"
                        max="10"
                        className="w-full px-3 py-2 border border-blue-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {editingSession ? (
                    <>
                      <Check size={18} />
                      Update Session
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Create Session
                    </>
                  )}
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
                  className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <X size={18} />
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

