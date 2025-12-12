import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useEffect } from 'react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Wealth Manager</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user?.name}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome!</h2>
            <p className="text-gray-600">
              You are successfully logged in. Start by setting up your financial goals.
            </p>
          </div>

          {/* Goals Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer" onClick={() => navigate('/goals')}>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Goals</h2>
            <p className="text-gray-600">
              Create and track your financial goals like retirement, home, education.
            </p>
          </div>

          {/* Portfolio Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer" onClick={() => navigate('/portfolio')}>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Portfolio</h2>
            <p className="text-gray-600">
              Build and manage your investment portfolio with live market updates.
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer" onClick={() => navigate('/profile')}>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Profile</h2>
            <p className="text-gray-600">
              Update your profile, risk profile, and complete KYC verification.
            </p>
          </div>

          {/* Recommendations Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer" onClick={() => navigate('/recommendations')}>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Recommendations</h2>
            <p className="text-gray-600">
              Get personalized investment recommendations based on your profile.
            </p>
          </div>

          {/* Reports Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer" onClick={() => navigate('/reports')}>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Reports</h2>
            <p className="text-gray-600">
              View detailed reports and export your financial data.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-l-4 border-indigo-600 pl-4">
              <p className="text-gray-600 text-sm">Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-800">$0.00</p>
            </div>
            <div className="border-l-4 border-emerald-600 pl-4">
              <p className="text-gray-600 text-sm">Active Goals</p>
              <p className="text-2xl font-bold text-gray-800">0</p>
            </div>
            <div className="border-l-4 border-yellow-600 pl-4">
              <p className="text-gray-600 text-sm">Monthly Investment</p>
              <p className="text-2xl font-bold text-gray-800">$0.00</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
