import { useState, useEffect } from "react";
import { useToastStore } from "../../../store/toastStore.js";
import { getDashboardStats } from "../../../features/admin/adminApi.js";
import { Plus, TrendingUp, Users, Calendar, Loader } from "lucide-react";

export default function AdminHome() {
  const toast = useToastStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const data = await getDashboardStats();
      setStats(data.stats || data);
      toast.success("Dashboard stats loaded");
    } catch (err) {
      console.error("Error fetching stats:", err);
      toast.error("Failed to load dashboard stats");
      // Fallback mock data for demo
      setStats({
        totalUsers: 49,
        totalGuides: 3,
        totalStudents: 45,
        totalTeams: 9,
        totalSessions: 7,
        totalSlots: 70,
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        slotUtilization: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
    { label: "Total Teams", value: stats?.totalTeams || 0, icon: Users, color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" },
    { label: "Total Sessions", value: stats?.totalSessions || 0, icon: Calendar, color: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" },
    { label: "Total Slots", value: stats?.totalSlots || 0, icon: TrendingUp, color: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Welcome to the admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`${card.color} p-6 rounded-lg shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">{card.label}</p>
                  <p className="text-3xl font-bold mt-2">{card.value}</p>
                </div>
                <Icon className="w-10 h-10 opacity-30" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Guides:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{stats?.totalGuides || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Students:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{stats?.totalStudents || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Pending Requests:</span>
              <span className="font-semibold text-slate-900 dark:text-white text-orange-600">{stats?.pendingRequests || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Request Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Total Requests:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{stats?.totalRequests || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Approved:</span>
              <span className="font-semibold text-slate-900 dark:text-white text-green-600">{stats?.approvedRequests || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Pending:</span>
              <span className="font-semibold text-slate-900 dark:text-white text-yellow-600">{stats?.pendingRequests || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
