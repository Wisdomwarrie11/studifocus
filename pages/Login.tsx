import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Brain, Zap } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [isStudent, setIsStudent] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#001b3d] p-6">
      <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl w-full max-w-md">

        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white/10 rounded-3xl mx-auto flex items-center justify-center text-white mb-6 border border-white/5 shadow-2xl">
            <Brain size={40} className="text-orange-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">StudiFocus</h1>
          <p className="text-white/40 mt-2 text-sm uppercase tracking-widest font-bold">Accountability Starts Here</p>
        </div>

        {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 text-xs p-4 rounded-2xl mb-6 text-center animate-shake">
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="group">
            <input
              type="email"
              placeholder="Username / Email"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-white text-sm placeholder:text-white/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="group">
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-white text-sm placeholder:text-white/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-orange-500 active:scale-95 transition-all shadow-xl shadow-orange-900/40 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
                <>
                  <Zap size={20} className="fill-white" />
                  <span>Start Learning</span>
                </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                Don't have an account?{' '}
                <Link to="/register" className="text-orange-500 hover:text-orange-400">
                    Register Here
                </Link>
            </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
