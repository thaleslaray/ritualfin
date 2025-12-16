import { motion } from "framer-motion";
import { Heart, TrendingUp, Calendar, Shield } from "lucide-react";

export const Logo = ({ size = "default" }: { size?: "default" | "large" }) => {
  const iconSize = size === "large" ? 32 : 24;
  const textSize = size === "large" ? "text-2xl" : "text-xl";
  
  return (
    <motion.div 
      className="flex items-center gap-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
          <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-secondary flex items-center justify-center">
          <TrendingUp className="w-2.5 h-2.5 text-secondary-foreground" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className={`${textSize} font-semibold text-foreground leading-tight`}>
          Ritual Financeiro
        </span>
        <span className="text-xs text-muted-foreground">do Casal</span>
      </div>
    </motion.div>
  );
};

export const FeatureIcon = ({ 
  icon: Icon, 
  color = "primary" 
}: { 
  icon: typeof Heart; 
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "destructive";
}) => {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent-foreground",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
      <Icon className="w-6 h-6" />
    </div>
  );
};

export const RitualBadge = () => (
  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
    <Calendar className="w-3.5 h-3.5" />
    <span>Ritual Ativo</span>
  </div>
);

export const TrustBadge = () => (
  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
    <Shield className="w-3.5 h-3.5" />
    <span>Dados protegidos</span>
  </div>
);
