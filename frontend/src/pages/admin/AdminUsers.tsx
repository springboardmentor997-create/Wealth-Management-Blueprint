import { useEffect, useState } from "react";
import { Trash2, User } from "lucide-react";
import { motion } from "framer-motion";
import { adminApi } from "@/services/adminApi";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================================
     FETCH USERS
  ================================ */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* ================================
     DELETE USER
  ================================ */
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmDelete) return;

    try {
      await adminApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (error) {
      console.error("Failed to delete user", error);
      alert("Failed to delete user");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Manage Users
        </h1>
        <p className="text-muted-foreground mt-1">
          View and remove platform users
        </p>
      </div>

      {/* Users Table */}
      <div className="glass-card p-6 rounded-2xl border border-white/10">
        {loading ? (
          <p className="text-center text-muted-foreground py-6">
            Loading users...
          </p>
        ) : users.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No users found
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-white/10">
                <th className="py-3">User</th>
                <th className="py-3">Email</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="py-4 flex items-center gap-3 text-white">
                    <User className="w-5 h-5 text-yellow-400" />
                    {user.name}
                  </td>

                  <td className="py-4 text-gray-300">
                    {user.email}
                  </td>

                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
};

export default AdminUsers;
