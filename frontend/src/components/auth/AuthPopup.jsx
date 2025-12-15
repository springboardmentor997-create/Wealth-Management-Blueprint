import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../common/Modal';

export default function AuthPopup({ isOpen, onClose }) {
  const [isLoginView, setIsLoginView] = useState(true); // Toggle between Login/Register
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth(); // Assuming you add register to useAuth, otherwise use authApi directly
  const navigate = useNavigate();

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginView) {
        // LOGIN LOGIC
        await login({ email: formData.email, password: formData.password });
      } else {
        // REGISTER LOGIC (If useAuth doesn't have register, import authApi here)
        // For now, assuming direct API call or useAuth expansion:
        const { authApi } = await import('../../api/authApi'); 
        await authApi.register(formData);
        // Auto-login after register
        await login({ email: formData.email, password: formData.password });
      }
      
      onClose(); // Close popup
      navigate('/dashboard'); // Go to dashboard
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* LEFT SIDE: Graphic (Like INDmoney) */}
      <div className="hidden md:flex w-1/2 bg-slate-900 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">Welcome to WealthPlan</h2>
          <p className="text-slate-400 text-lg">
            Track your goals, analyze portfolios, and simulate your financial future in one place.
          </p>
        </div>
        
        {/* Abstract shapes for decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500 rounded-full blur-3xl opacity-20 -ml-10 -mb-10"></div>
        
        <div className="relative z-10 text-sm text-slate-500">
          Trusted by  Thousands.
        </div>
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

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Field (Only for Register) */}
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

        <div className="mt-6 text-center text-sm text-slate-500">
          {isLoginView ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => { setIsLoginView(!isLoginView); setError(''); }}
            className="text-blue-600 font-bold hover:underline focus:outline-none"
          >
            {isLoginView ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </Modal>
  );
}