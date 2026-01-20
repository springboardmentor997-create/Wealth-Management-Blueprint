import { useEffect, useState } from "react";
import { Users, BarChart3, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { adminApi, type AdminStats } from "@/services/adminApi";

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          System overview & platform health
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-muted-foreground">
          Loading statistics...
        </p>
      )}

      {/* Stats */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Users */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.totalUsers}
                </p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Portfolios */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Portfolios
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.activePortfolios}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          {/* Goals */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Goals
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.totalGoals}
                </p>
              </div>
              <ShieldCheck className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminDashboard;
