import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client'; // 👈 IMPORT ADDED
import { authApi } from '../../api/authApi'; 
import Modal from '../common/Modal';

export default function AuthPopup({ isOpen, onClose }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      // ==========================
      // 1. REGISTRATION LOGIC 📝
      // ==========================
      if (!isLoginView) {
  // We must send 'name' because the backend UserCreate schema requires it
  await authApi.register({
    name: formData.name,      // 👈 ADDED THIS LINE
    email: formData.email,
    password: formData.password
  });
  
  setSuccessMsg('Account created! Switching to Login...');
  setTimeout(() => {
      setIsLoginView(true); 
      setSuccessMsg('');
  }, 1500);
  setLoading(false);
  return; 
}

      // ==========================
      // 2. LOGIN LOGIC 🔐
      // ==========================
      
      // ⚠️ FastAPI expects Form Data (username/password), NOT JSON
      const params = new URLSearchParams();
      params.append('username', formData.email); // Map email to username
      params.append('password', formData.password);

      const res = await client.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const token = res.data.access_token;
      localStorage.setItem('token', token);

      // 3. Check Role (Admin vs User) 🕵️‍♂️
      const userRes = await client.get('/users/me');
      const role = userRes.data.role;
      localStorage.setItem('role', role);

      // 4. Redirect based on Role 🔀
      if (role === 'admin') {
        console.log("👑 Admin Detected! Redirecting...");
        navigate('/admin');
      } else {
        console.log("👤 User Detected! Redirecting...");
        navigate('/dashboard');
      }

      // 5. Close Popup
      if (onClose) onClose();

    } catch (err) {
      console.error("Auth Failed", err);
      // Handle specific error messages
      const msg = err.response?.data?.detail || 'Authentication failed. Please check your credentials.';
      setError(msg);
    } finally {
      if (isLoginView) setLoading(false); // Only stop loading if we didn't just switch views
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex w-full h-full min-h-[500px]">
        {/* LEFT SIDE: Graphic (Hidden on mobile) */}
        <div className="hidden md:flex w-1/2 bg-slate-900 p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Welcome to WealthPlan</h2>
            <p className="text-slate-400 text-lg">
              Track your goals, analyze portfolios, and simulate your financial future in one place.
            </p>
          </div>
          {/* Decorative Blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500 rounded-full blur-3xl opacity-20 -ml-10 -mb-10"></div>
          <div className="relative z-10 text-sm text-slate-500">Trusted by Thousands.</div>
        </div>

        {/* RIGHT SIDE: The Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900">
              {isLoginView ? 'Sign in to Continue' : 'Create your Account'}
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              {isLoginView ? 'Welcome back! Please enter your details.' : 'Start your journey to financial freedom.'}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg border border-emerald-100 flex items-center gap-2">
              <span className="text-lg">✅</span> {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginView && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required={!isLoginView}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Rahul Sharma"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-70 mt-2"
            >
              {loading ? 'Processing...' : (isLoginView ? 'Login' : 'Sign Up Free')}
            </button>
          </form>

          {/* Toggle View Link */}
          <div className="mt-6 text-center text-sm text-slate-500">
            {isLoginView ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { 
                setIsLoginView(!isLoginView); 
                setError(''); 
                setSuccessMsg(''); 
              }}
              className="text-blue-600 font-bold hover:underline focus:outline-none"
            >
              {isLoginView ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}