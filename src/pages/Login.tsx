import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password, role);
    if (!success) {
      setError('Invalid credentials or wrong role. Please use correct role for your account.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#1e3a5f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#d4af37] rounded-full mb-4">
            <span className="text-[#1e3a5f] text-3xl font-bold">CS</span>
          </div>
          <h1 className="text-3xl font-bold text-white">CSJMU Inventory System</h1>
          <p className="text-[#d4af37] mt-2">Chhatrapati Shahu Ji Maharaj University</p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-[#1e3a5f] mb-6 text-center">Secure Login</h2>
          
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setRole('admin')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${role === 'admin' ? 'bg-[#1e3a5f] text-white' : 'text-gray-600'}`}
            >
              Admin Panel
            </button>
            <button
              onClick={() => setRole('user')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${role === 'user' ? 'bg-[#1e3a5f] text-white' : 'text-gray-600'}`}
            >
              Mobile App (Labour)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d4af37]"
                placeholder={role === 'admin' ? 'admin@csjmu.ac.in' : 'labour@csjmu.ac.in'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d4af37]"
                placeholder={role === 'admin' ? 'admin123' : 'user123'}
                required
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e3a5f] hover:bg-[#0f1f33] text-white py-3 rounded-lg font-semibold transition disabled:opacity-70"
            >
              {loading ? 'Signing in...' : `Sign in as ${role === 'admin' ? 'Admin' : 'Labour/User'}`}
            </button>
          </form>

          <div className="mt-6 text-xs text-center text-gray-500">
            Demo Credentials: admin@csjmu.ac.in / admin123 &nbsp;•&nbsp; labour@csjmu.ac.in / user123
          </div>
        </div>
      </div>
    </div>
  );
}
