import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './admin/pages/AdminDashboard';
import MobileDashboard from './mobile/pages/MobileDashboard';

function AppContent() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e3a5f]">
        <div className="text-white text-xl">Loading CSJMU Inventory System...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1e3a5f] text-white px-6 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="font-semibold">CSJMU Inventory &amp; Barcode System</span>
          <span className="text-[#d4af37]">•</span>
          <span>{user.role === 'admin' ? 'Administrator' : 'Labour/User'}</span>
        </div>
        <button onClick={logout} className="px-4 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition">Logout</button>
      </div>

      {user.role === 'admin' ? <AdminDashboard /> : <MobileDashboard />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
