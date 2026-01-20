import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ================================
   BASE ANIMATED CARD
================================ */

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  onClick?: () => void;
}

const AnimatedCard = ({
  children,
  className,
  delay = 0,
  hover = true,
  onClick,
}: AnimatedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={hover ? { y: -4 } : undefined}
      onClick={onClick}
      className={cn(
        "glass-card p-6 transition-shadow duration-300",
        hover && "cursor-pointer hover:shadow-lg hover:shadow-primary/10",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;

/* ================================
   STAT CARD
================================ */

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  delay?: number;
}

export const StatCard = ({ icon, label, value, delay = 0 }: StatCardProps) => {
  return (
    <AnimatedCard delay={delay}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-primary">{icon}</div>
      </div>
    </AnimatedCard>
  );
};

/* ================================
   GOAL CARD  ✅ FIXED & EXPORTED
================================ */

interface GoalCardProps {
  name: string;
  current: number;
  target: number;
  deadline: string;
  status: "on_track" | "at_risk" | "behind";
  category: string;
  delay?: number;
}

export const GoalCard = ({
  name,
  current,
  target,
  deadline,
  status,
  category,
  delay = 0,
}: GoalCardProps) => {
  const progress = Math.min((current / target) * 100, 100);

  const statusColor = {
    on_track: "text-emerald-500",
    at_risk: "text-yellow-500",
    behind: "text-red-500",
  }[status];

  return (
    <AnimatedCard delay={delay}>
      <div className="space-y-3">
        <div className="flex justify-between">
          <h3 className="font-semibold">{name}</h3>
          <span className={cn("text-sm font-medium", statusColor)}>
            {status.replace("_", " ")}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">{category}</p>

        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            ₹{current} / ₹{target}
          </span>
          <span>{new Date(deadline).toLocaleDateString()}</span>
        </div>
      </div>
    </AnimatedCard>
  );
};
