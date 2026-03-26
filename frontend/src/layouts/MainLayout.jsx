import React from "react";

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4">
        <h1 className="text-xl font-bold mb-6">Slot System</h1>

        <nav className="space-y-3">
          <p className="hover:underline cursor-pointer">Dashboard</p>
          <p className="hover:underline cursor-pointer">Sessions</p>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        
        {/* Topbar */}
        <div className="bg-white shadow p-4 flex justify-between">
          <span className="font-semibold">Dashboard</span>
          <button className="bg-red-500 text-white px-3 py-1 rounded">
            Logout
          </button>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </div>

    </div>
  );
}