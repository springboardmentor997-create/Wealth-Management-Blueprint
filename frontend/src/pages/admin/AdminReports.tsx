import { useEffect, useState } from "react";
import { Users, TrendingUp, FileText } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedCard from "@/components/ui/AnimatedCard";
import { adminApi, type AdminStats } from "@/services/adminApi";

const AdminReports = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================================
     FETCH REAL ADMIN REPORT DATA
  ================================ */
  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load admin reports", error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Reports</h1>
        <p className="text-muted-foreground">
          Platform analytics and activity reports
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-muted-foreground py-6">
          Loading reports...
        </p>
      )}

      {/* Stats */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold mt-2">
                  {stats.totalUsers}
                </p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.1}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Portfolios
                </p>
                <p className="text-3xl font-bold mt-2">
                  {stats.activePortfolios}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Goals
                </p>
                <p className="text-3xl font-bold mt-2">
                  {stats.totalGoals}
                </p>
              </div>
              <FileText className="w-8 h-8 text-red-400" />
            </div>
          </AnimatedCard>
        </div>
      )}
    </motion.div>
  );
};

export default AdminReports;
