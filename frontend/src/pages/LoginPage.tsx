import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/api/client';

interface LoginPageProps {
  onLoginSuccess: (token: string, refreshToken: string, user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login/', {
        email: email.trim().toLowerCase(),
        password: password
      });
      
      const userData = res.data.user;
      onLoginSuccess(res.data.access, res.data.refresh, userData);
      
      if (userData?.is_staff) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Invalid email or password. Please check your credentials.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-xl space-y-6">
        
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-xs text-gray-500">Sign in to your account. Admin users are redirected to Admin Panel.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@priyoshop.com or customer@example.com"
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-900 text-xs space-y-2 border border-gray-100 dark:border-dark-700">
          <p className="font-bold text-gray-900 dark:text-white">🔑 Demo Accounts Quick Login:</p>
          <div className="flex flex-col gap-1 text-[11px] text-gray-600 dark:text-gray-300">
            <button
              type="button"
              onClick={() => { setEmail('admin@priyoshop.com'); setPassword('admin123'); }}
              className="text-left text-brand-600 hover:underline font-medium"
            >
              • Super Admin: admin@priyoshop.com / admin123
            </button>
            <button
              type="button"
              onClick={() => { setEmail('customer@example.com'); setPassword('customer123'); }}
              className="text-left text-brand-600 hover:underline font-medium"
            >
              • Demo Customer: customer@example.com / customer123
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          Don't have an account? <Link to="/register" className="text-brand-600 font-bold hover:underline">Register Now</Link>
        </div>

      </div>
    </div>
  );
};
