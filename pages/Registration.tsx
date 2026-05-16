import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Brain, Zap, User, Mail, Lock } from 'lucide-react';

const Register: React.FC = () => {
  const { register } = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#001b3d] p-6">
      <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/10 rounded-3xl mx-auto flex items-center justify-center text-white mb-6 border border-white/5 shadow-2xl">
            <Brain size={40} className="text-orange-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Join StudiFocus</h1>
          <p className="text-white/40 mt-2 text-sm uppercase tracking-widest font-bold">Start Your Mastery Journey</p>
        </div>

        {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 text-xs p-4 rounded-2xl mb-6 text-center animate-shake">
                {error}
            </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="text"
              placeholder="Full Name"
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-white text-sm placeholder:text-white/20"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-white text-sm placeholder:text-white/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="password"
              placeholder="Create Password"
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-white text-sm placeholder:text-white/20"
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
                  <span>Create Account</span>
                </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                Already have an account?{' '}
                <Link to="/login" className="text-orange-500 hover:text-orange-400">
                    Log in
                </Link>
            </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
