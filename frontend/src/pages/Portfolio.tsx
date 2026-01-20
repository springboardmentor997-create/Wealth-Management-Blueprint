import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { DollarSign, TrendingUp, Layers, Percent } from "lucide-react";


import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/AnimatedCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassInput from "@/components/ui/GlassInput";

import {
  portfolioApi,
  PortfolioAsset,
} from "@/services/portfolioApi";

import {
  staggerContainer,
  staggerItem,
} from "@/components/layout/PageTransition";

const Portfolio = () => {
  const qc = useQueryClient();

  /* ================================
     FORM STATE
  ================================ */
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "stock" as "stock" | "etf" | "crypto" | "bond",
    quantity: "",
    buyPrice: "",
    currentPrice: "",
  });

  /* ================================
     FETCH ASSETS
  ================================ */
  const { data: assets = [] } = useQuery<PortfolioAsset[]>({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const res = await portfolioApi.getAll();
      return res.data ?? [];
    },
  });

  /* ================================
     CREATE ASSET
  ================================ */
  const createAsset = useMutation({
    mutationFn: () =>
      portfolioApi.create({
        name: form.name,
        type: form.type,
        quantity: Number(form.quantity),
        buyPrice: Number(form.buyPrice),
        currentPrice: Number(form.currentPrice),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portfolio"] });
      setOpen(false);
      setForm({
        name: "",
        type: "stock",
        quantity: "",
        buyPrice: "",
        currentPrice: "",
      });
    },
  });

  /* ================================
     DELETE ASSET
  ================================ */
  const deleteAsset = useMutation({
    mutationFn: (id: string) => portfolioApi.delete(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["portfolio"] }),
  });

  /* ================================
     CALCULATIONS
  ================================ */
  const totalValue = assets.reduce(
    (s, a) => s + a.quantity * a.currentPrice,
    0
  );

  const invested = assets.reduce(
    (s, a) => s + a.quantity * a.buyPrice,
    0
  );

  const gain = totalValue - invested;
  const returnPct =
    invested === 0 ? 0 : (gain / invested) * 100;

 const stats = [
  {
    label: "Total Value",
    value: `₹${totalValue.toFixed(0)}`,
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    label: "Total Gain",
    value: `₹${gain.toFixed(0)}`,
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    label: "Holdings",
    value: assets.length,
    icon: <Layers className="w-5 h-5" />,
  },
  {
    label: "Return",
    value: `${returnPct.toFixed(2)}%`,
    icon: <Percent className="w-5 h-5" />,
  },
];


  /* ================================
     UI
  ================================ */
  return (
    <DashboardLayout>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={staggerItem}>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">
            Manage and track your investments.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={staggerItem}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </motion.div>

        {/* Add Asset */}
        <GlassButton
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setOpen(!open)}
        >
          Add Asset
        </GlassButton>

        {open && (
          <div className="glass-card p-6 max-w-md">
            <div className="space-y-3">
              <GlassInput
                label="Asset Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
              <GlassInput
                label="Quantity"
                type="number"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: e.target.value })
                }
              />
              <GlassInput
                label="Buy Price"
                type="number"
                value={form.buyPrice}
                onChange={(e) =>
                  setForm({ ...form, buyPrice: e.target.value })
                }
              />
              <GlassInput
                label="Current Price"
                type="number"
                value={form.currentPrice}
                onChange={(e) =>
                  setForm({
                    ...form,
                    currentPrice: e.target.value,
                  })
                }
              />
              <GlassButton
                className="w-full"
                onClick={() => createAsset.mutate()}
              >
                Save Asset
              </GlassButton>
            </div>
          </div>
        )}

        {/* Asset List */}
        <div className="grid gap-4">
          {assets.map((a) => (
            <div
              key={a._id}
              className="glass-card p-4 flex justify-between"
            >
              <div>
                <h3 className="font-semibold">{a.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {a.quantity} × ₹{a.currentPrice}
                </p>
              </div>
              <button
                onClick={() => deleteAsset.mutate(a._id)}
                className="text-red-500"
              >
                <Trash2 />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Portfolio;
