import { useNavigate } from 'react-router-dom';

const PagePlaceholder = ({ title, description }: { title: string; description: string }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-700">
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-indigo-600">💰 Wealth Manager</h1>
            <div></div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{title}</h2>
          <p className="text-gray-600 text-lg">{description}</p>
          <p className="text-gray-500 mt-6">Coming soon...</p>
        </div>
      </main>
    </div>
  );
};

export const Goals = () => <PagePlaceholder title="Financial Goals" description="Create and manage your financial goals" />;
export const Portfolio = () => <PagePlaceholder title="Investment Portfolio" description="Build and track your investment portfolio" />;
export const Profile = () => <PagePlaceholder title="User Profile" description="Manage your profile and risk settings" />;
export const Recommendations = () => <PagePlaceholder title="Recommendations" description="Get personalized investment recommendations" />;
export const Reports = () => <PagePlaceholder title="Reports" description="View and export financial reports" />;
