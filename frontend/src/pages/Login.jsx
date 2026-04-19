import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <-- NEW: Imported Link

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        localStorage.setItem('username', username);
        navigate('/dashboard');
      } else {
        setError("Invalid username or password.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#04060a] font-display h-screen flex items-center justify-center relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* NEW: The "Escape Hatch" Back Button */}
      <Link to="/" className="absolute top-8 left-8 md:top-10 md:left-10 flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-semibold group z-20">
        <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
        Back to Website
      </Link>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="z-10 w-full max-w-md p-8 sm:p-10">
        <div className="text-center mb-10">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 size-16 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] mx-auto mb-6">
            <span className="material-symbols-outlined text-white text-3xl">movie_edit</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h1>
          <p className="text-indigo-300/70 font-medium">Log in to your Creaolink Workspace</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#0a0f1c]/80 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 mb-2">Username</label>
              <input
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#04060a] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder-slate-700"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 mb-2">Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#04060a] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder-slate-700"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="h-6 mt-4">
            {error && <p className="text-rose-400 text-xs font-medium text-center animate-pulse">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;