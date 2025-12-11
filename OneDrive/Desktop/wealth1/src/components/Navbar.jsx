import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between px-6">
      <Link to="/" className="text-xl font-semibold">
        AuthApp
      </Link>

      <div className="flex gap-4">
        {!user && (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}

        {user && (
          <button
            onClick={logout}
            className="bg-red-500 px-4 py-1 text-white rounded"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

