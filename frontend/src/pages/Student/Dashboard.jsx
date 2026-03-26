import { useState } from "react";
import { useAuthStore } from "../../store/authStore.js";
import { useToastStore } from "../../store/toastStore.js";
import { LogOut, BookOpen, Clock } from "lucide-react";

export default function StudentDashboard() {
  const { user, logout, clearStorage } = useAuthStore();
  const { success } = useToastStore();
  const [activeMenu, setActiveMenu] = useState("book");

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
          <p className="text-xs text-slate-500 mt-1">Student Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveMenu("book")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeMenu === "book"
                ? "bg-blue-600 text-white"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Book Slot</span>
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
            <span className="font-medium">My Bookings</span>
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Student Dashboard</h1>
        {activeMenu === "book" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Book Your Slot</h2>
            <p className="text-slate-600 dark:text-slate-400">Slot booking interface coming soon...</p>
          </div>
        )}
        {activeMenu === "bookings" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
            <p className="text-slate-600 dark:text-slate-400">Booking history coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}