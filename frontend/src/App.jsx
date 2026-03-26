import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore.js";
import { useToastStore } from "./store/toastStore.js";

// Pages
import LoginPage from "./pages/Auth/Login.jsx";
import AdminDashboard from "./pages/Admin/Dashboard.jsx";
import GuideDashboard from "./pages/Guide/Dashboard.jsx";
import StudentDashboard from "./pages/Student/Dashboard.jsx";

// Components
import Toast from "./components/ui/Toast.jsx";

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default function App() {
  const { loadFromStorage, isAuthenticated, user } = useAuthStore();
  const { toasts } = useToastStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFromStorage();
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="mb-4 animate-spin">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Guide Routes */}
          <Route
            path="/guide/*"
            element={
              <ProtectedRoute requiredRole="guide">
                <GuideDashboard />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirect to appropriate dashboard based on role */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                user?.role === "admin" ? (
                  <Navigate to="/admin" />
                ) : user?.role === "guide" ? (
                  <Navigate to="/guide" />
                ) : (
                  <Navigate to="/student" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* Toast Container */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} />
          ))}
        </div>
      </div>
    </Router>
  );
}
