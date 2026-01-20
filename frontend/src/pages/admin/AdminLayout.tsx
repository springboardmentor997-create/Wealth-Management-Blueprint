import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FileText, LogOut } from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();

  const navItem = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
      location.pathname === path
        ? "bg-yellow-500 text-black font-semibold"
        : "text-gray-300 hover:bg-white/10 hover:text-white"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      {/* Sidebar */}
      <aside className="w-64 p-6 flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-white mb-10 tracking-wide">
          Wealth Admin
        </h2>

        <nav className="flex-1 space-y-2">
          <Link to="/admin/dashboard" className={navItem("/admin/dashboard")}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link to="/admin/users" className={navItem("/admin/users")}>
            <Users size={18} />
            Users
          </Link>

          <Link to="/admin/reports" className={navItem("/admin/reports")}>
            <FileText size={18} />
            Reports
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-white/10 hover:text-red-300 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
