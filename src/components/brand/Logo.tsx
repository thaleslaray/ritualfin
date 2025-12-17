import { motion } from "framer-motion";

export const Logo = ({ size = "default" }: { size?: "default" | "large" }) => {
  const textSize = size === "large" ? "text-2xl" : "text-lg";
  
  return (
    <motion.div 
      className="flex items-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center">
          <span className="text-background font-bold text-lg">R</span>
        </div>
      </div>
      <span className={`${textSize} font-semibold text-foreground tracking-tight`}>
        Ritual
      </span>
    </motion.div>
  );
};

export const RitualBadge = () => (
  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
    <div className="w-1.5 h-1.5 rounded-full bg-success" />
    <span>Mês Fechado</span>
  </div>
);

export const FeatureIcon = ({ 
  icon: Icon, 
  color = "primary" 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "destructive";
}) => {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClasses[color]}`}>
      <Icon className="w-6 h-6" />
    </div>
  );
};

export const TrustBadge = () => (
  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium">
    <span>Dados protegidos</span>
  </div>
);
