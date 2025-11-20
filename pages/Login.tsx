// Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Login: React.FC = () => {
  const { login } = useApp(); // use context login function
  const navigate = useNavigate();
  const [isStudent, setIsStudent] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    const email = (form.elements[0] as HTMLInputElement).value;
    const password = (form.elements[1] as HTMLInputElement).value;

    try {
      // Call context login (handles saving user in context + localStorage)
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-xl mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4">
            SF
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome to StudiFocus</h1>
          <p className="text-gray-500 mt-2">Accountability starts here.</p>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          <button
            type="button"
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              isStudent ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setIsStudent(true)}
          >
            Student
          </button>

          <button
            type="button"
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              !isStudent ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => navigate('/adminlogin')}
          >
            Admin
          </button>
        </div>

        {isStudent && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              {loading ? 'Logging in...' : 'Start Learning'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>
            Don't have an account?{' '}
            <span
              className="text-primary font-medium cursor-pointer"
              onClick={() => navigate('/register')}
            >
              Register here
            </span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;