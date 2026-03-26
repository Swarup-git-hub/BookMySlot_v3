import { useState } from "react";
import { useAuthStore } from "../../store/authStore.js";
import { useToastStore } from "../../store/toastStore.js";
import { LogOut, BarChart3, Users, Calendar, Layers } from "lucide-react";
import AdminHome from "./pages/AdminHome.jsx";
import SessionsManagement from "./pages/SessionsManagement.jsx";
import UsersManagement from "./pages/UsersManagement.jsx";
import TeamsManagement from "./pages/TeamsManagement.jsx";
import Analytics from "./pages/Analytics.jsx";

export default function AdminDashboard() {
  const { user, logout, clearStorage } = useAuthStore();
  const { success } = useToastStore();
  const [activeMenu, setActiveMenu] = useState("home");

  const handleLogout = () => {
    logout();
    clearStorage();
    success("Logged out successfully");
    window.location.href = "/login";
  };

  const menuItems = [
    { id: "home", label: "Dashboard", icon: BarChart3 },
    { id: "sessions", label: "Sessions", icon: Calendar },
    { id: "users", label: "Users", icon: Users },
    { id: "teams", label: "Teams", icon: Layers },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-slate-800 shadow-lg flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Review Slot</h1>
          <p className="text-xs text-slate-500 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  activeMenu === item.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeMenu === "home" && <AdminHome />}
          {activeMenu === "sessions" && <SessionsManagement />}
          {activeMenu === "users" && <UsersManagement />}
          {activeMenu === "teams" && <TeamsManagement />}
          {activeMenu === "analytics" && <Analytics />}
        </div>
      </div>
    </div>
  );
}
