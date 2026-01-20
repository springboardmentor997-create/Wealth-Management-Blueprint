import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Users, Target, BarChart3, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

import DashboardLayout from "@/components/layout/DashboardLayout";
import AnimatedCard from "@/components/ui/AnimatedCard";
import { Badge } from "@/components/ui/badge";
import { adminApi, type AdminStats } from "@/services/adminApi";

const Admin = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load admin stats", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - WealthTrack</title>
      </Helmet>

      <DashboardLayout>
        {/* Disable unwanted text selection */}
        <div className="space-y-6 select-none">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Monitor platform activity and security
              </p>
            </div>

            <Badge
              variant="outline"
              className="bg-primary/20 text-primary border-primary/30 pointer-events-none"
            >
              <ShieldCheck className="w-3 h-3 mr-1" />
              Admin Access
            </Badge>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center text-muted-foreground py-12">
              Loading admin statistics...
            </div>
          )}

          {/* Stats */}
          {!loading && stats && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Total Users */}
              <AnimatedCard className="focus:outline-none">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Users
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {stats.totalUsers}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </AnimatedCard>

              {/* Total Goals */}
              <AnimatedCard delay={0.1} className="focus:outline-none">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Goals
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {stats.totalGoals}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-yellow-400" />
                </div>
              </AnimatedCard>

              {/* Active Portfolios */}
              <AnimatedCard delay={0.2} className="focus:outline-none">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Active Portfolios
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {stats.activePortfolios}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-emerald-400" />
                </div>
              </AnimatedCard>
            </motion.div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default Admin;
