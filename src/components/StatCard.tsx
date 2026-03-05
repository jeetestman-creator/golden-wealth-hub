import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  subtext?: string;
}

const StatCard = ({ icon, label, value, subtext }: StatCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card-hover rounded-xl p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-display font-bold text-foreground">{value}</p>
          {subtext && <p className="text-xs text-primary mt-1">{subtext}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
