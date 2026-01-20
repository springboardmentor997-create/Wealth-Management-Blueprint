import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // demo admin credentials (frontend-only)
    if (email === "admin@wealth.com" && password === "admin123") {
      localStorage.setItem("adminToken", "admin-token");
      navigate("/admin/dashboard");
    } else {
      alert("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-900">
      <form
        onSubmit={handleLogin}
        className="w-[420px] rounded-2xl bg-white/5 backdrop-blur-xl p-8 shadow-2xl border border-white/10"
      >
        <h1 className="text-3xl font-bold text-white text-center">
          Admin Access
        </h1>
        <p className="text-muted-foreground text-center mt-2 mb-8">
          WealthTrack Secure Admin Panel
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Admin Email"
            className="w-full px-4 py-3 rounded-xl bg-black/40 text-white placeholder-gray-400 outline-none border border-white/10 focus:border-yellow-400 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl bg-black/40 text-white placeholder-gray-400 outline-none border border-white/10 focus:border-yellow-400 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full mt-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-semibold transition"
        >
          Secure Login
        </button>

        <p className="text-xs text-gray-500 text-center mt-6">
          Authorized administrators only
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
