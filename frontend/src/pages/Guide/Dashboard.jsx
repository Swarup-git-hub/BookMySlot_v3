import { useState } from "react";
import { useAuthStore } from "../../store/authStore.js";
import { useToastStore } from "../../store/toastStore.js";
import { LogOut, Calendar, CheckCircle, Clock } from "lucide-react";
import MyTeams from "./MyTeams.jsx";
import PendingRequests from "./PendingRequests.jsx";
import TeamBookings from "./TeamBookings.jsx";

export default function GuideDashboard() {
  const { user, logout, clearStorage } = useAuthStore();
  const { success } = useToastStore();
  const [activeMenu, setActiveMenu] = useState("teams");

  const handleLogout = () => {
    logout();
    clearStorage();
    success("Logged out successfully");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-slate-800 shadow-lg flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Review Slot</h1>
          <p className="text-xs text-slate-500 mt-1">Guide Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveMenu("teams")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeMenu === "teams"
                ? "bg-blue-600 text-white"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">My Teams</span>
          </button>
          <button
            onClick={() => setActiveMenu("requests")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeMenu === "requests"
                ? "bg-blue-600 text-white"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Pending Requests</span>
          </button>
          <button
            onClick={() => setActiveMenu("bookings")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeMenu === "bookings"
                ? "bg-blue-600 text-white"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="font-medium">Team Bookings</span>
          </button>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Guide Dashboard</h1>
        {activeMenu === "teams" && <MyTeams />}
        {activeMenu === "requests" && <PendingRequests />}
        {activeMenu === "bookings" && <TeamBookings />}
      </div>
    </div>
  );
}
