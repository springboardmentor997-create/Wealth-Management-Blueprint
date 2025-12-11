import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signup(email, password);
      navigate("/");
    } catch (err) {
      setError(err?.message || "Registration failed. Check your Firebase configuration.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleRegister} className="bg-white shadow-lg p-8 rounded-lg w-96">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <h1 className="text-3xl mb-6 font-bold text-gray-900">Register</h1>

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

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="border border-gray-300 w-full p-2 rounded focus:outline-none focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            className="border border-gray-300 w-full p-2 rounded focus:outline-none focus:border-blue-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded font-semibold">
          Create Account
        </button>

        <p className="text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
