import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { signin, signInWithGoogle } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signin(email, password);
      navigate("/");
    } catch (err) {
      setError(err?.message || "Login failed. Check your Firebase configuration.");
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (err) {
      setError(
        err?.message || "Google sign-in failed. Make sure Firebase is configured and Google provider is enabled."
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleLogin} className="bg-white shadow-lg p-8 rounded-lg w-96">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <h1 className="text-3xl mb-6 font-bold text-gray-900">Login</h1>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="border border-gray-300 w-full p-2 rounded focus:outline-none focus:border-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="border border-gray-300 w-full p-2 rounded focus:outline-none focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded font-semibold">
          Login
        </button>

        <button
          type="button"
          onClick={handleGoogle}
          className="mt-4 w-full py-2 rounded border border-gray-300 bg-white flex items-center justify-center gap-3 hover:shadow-sm"
          aria-label="Sign in with Google"
        >
          <span className="flex items-center">
            <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.5-34.1-4.4-50.4H272v95.4h146.9c-6.3 34.1-25.8 62.9-55.3 82.1v68.3h89.4c52.4-48.2 82.5-119.4 82.5-195.4z"/>
              <path fill="#34A853" d="M272 544.3c74.4 0 136.9-24.6 182.6-66.9l-89.4-68.3c-24.9 16.7-56.7 26.6-93.2 26.6-71.7 0-132.5-48.4-154.3-113.4H28.9v71.1C74.6 488.5 166.8 544.3 272 544.3z"/>
              <path fill="#FBBC04" d="M117.7 327.4c-10.8-32.4-10.8-67.3 0-99.7V156.6H28.9C10.2 197.4 0 238.9 0 278.4s10.2 81 28.9 121.8l88.8-72.8z"/>
              <path fill="#EA4335" d="M272 109.1c39.7 0 75.4 13.7 103.5 40.8l77.6-77.6C409.1 24.8 347.9 0 272 0 166.8 0 74.6 55.8 28.9 140.2l88.8 71.1C139.5 157.5 200.3 109.1 272 109.1z"/>
            </svg>
          </span>
          <span className="text-gray-700 font-medium">Login with Google</span>
        </button>

        <p className="text-center mt-4 text-gray-600">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
