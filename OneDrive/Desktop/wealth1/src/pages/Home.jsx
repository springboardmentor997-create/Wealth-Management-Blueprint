import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Welcome!</h1>

      {user ? (
        <div>
          <p className="text-xl text-gray-700 mb-4">
            Logged in as: <span className="font-semibold text-blue-600">{user.email}</span>
          </p>
          <p className="text-gray-600">You are logged into Wealth App.</p>
        </div>
      ) : (
        <div>
          <p className="text-xl text-gray-700 mb-6">
            Please login or register to continue.
          </p>
          <div className="flex gap-4">
            <a href="/login" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
              Login
            </a>
            <a href="/register" className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg">
              Register
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
