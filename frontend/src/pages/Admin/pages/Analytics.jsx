import { useState, useEffect } from 'react';
import { useToastStore } from '../../../store/toastStore.js';
import { BarChart3, Users, CalendarDays, TrendingUp, Download, Filter } from 'lucide-react';
import apiClient from '../../../services/apiClient.js';

export default function Analytics() {
  const toast = useToastStore();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/api/analytics/summary?range=${dateRange}`);
      setStats(data);
    } catch (err) {
      toast.error('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Sessions',
      value: stats.totalSessions || 0,
      change: '+8%',
      icon: CalendarDays,
      color: 'bg-green-500',
    },
    {
      title: 'Bookings',
      value: stats.totalRequests || 0,
      change: '+25%',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Approval Rate',
      value: stats.approvalRate || '0%',
      change: '+5%',
      icon: BarChart3,
      color: 'bg-orange-500',
    },
  ];

  const handleExport = async (format) => {
    try {
      const url = `/api/export/analytics/${format}?range=${dateRange}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${dateRange}.${format}`;
      link.click();
      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Export failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">System performance and usage insights</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2">
            <Download size={16} />
            CSV
          </button>
          <button onClick={() => handleExport('excel')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2">
            <Download size={16} />
            Excel
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Date Range:</label>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
            {['7d', '30d', '90d', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                  dateRange === range
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {range === '7d' ? '1W' : range === '30d' ? '1M' : range === '90d' ? '3M' : 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div key={index} className="group bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-200/50 dark:border-slate-600/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 opacity-80">{card.title}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{card.value}</p>
                <p className="text-xs font-medium mt-1 inline-flex items-center gap-1 {card.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                  {card.change}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.color}/10 group-hover:${card.color}/20 transition`}>
                <card.icon className={`w-8 h-8 ${card.color}/70 group-hover:${card.color}/90 transition`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts/Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-4 font-semibold transition ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-4 font-semibold transition ${
              activeTab === 'bookings'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-6 py-4 font-semibold transition ${
              activeTab === 'performance'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Performance
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Booking Trends</h3>
                <div className="h-64 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6">
                  <p className="text-slate-500 dark:text-slate-400">📊 Chart placeholder (Recharts ready)</p>
                  <p>Daily bookings: {stats.dailyBookings || 0}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Team Performance</h3>
                <div className="space-y-4">
                  {(stats.teamPerformance || []).slice(0, 4).map((team, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <span>{team.name}</span>
                      <span className="font-semibold">{team.approvalRate}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Recent Bookings</h3>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-6">
                <p className="text-slate-500 dark:text-slate-400 mb-4">{stats.recentBookings?.length || 0} bookings</p>
                {(stats.recentBookings || []).slice(0, 5).map((booking, i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-slate-200 last:border-b-0">
                    <div>
                      <p className="font-semibold">{booking.studentName}</p>
                      <p className="text-sm text-slate-500">{booking.slotTime}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${booking.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Guide Performance</h3>
                <div className="space-y-3">
                  {(stats.guidePerformance || []).slice(0, 3).map((guide, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <p className="font-semibold">{guide.name}</p>
                        <p className="text-sm text-slate-500">{guide.teams} teams</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{guide.bookings}</p>
                        <p className="text-xs text-slate-500">{guide.approvalRate}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Slot Utilization</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.slotUtilization || 0}%</p>
                    <p className="text-sm text-slate-500">Used</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg text-center">
                    <p className="text-2xl font-bold text-slate-600">{(100 - (stats.slotUtilization || 0))}%</p>
                    <p className="text-sm text-slate-500">Available</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

