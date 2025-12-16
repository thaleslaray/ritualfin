import { motion } from "framer-motion";
import { getCategoryInfo } from "@/components/transactions/CategoryPopup";

interface BudgetCategory {
  id: string;
  planned: number;
  actual: number;
}

interface BudgetComparisonProps {
  categories: BudgetCategory[];
  showLabels?: boolean;
}

export const BudgetComparison = ({ categories, showLabels = true }: BudgetComparisonProps) => {
  const maxValue = Math.max(...categories.flatMap(c => [c.planned, c.actual]));

  return (
    <div className="space-y-4">
      {categories.map((category, index) => {
        const info = getCategoryInfo(category.id);
        const plannedWidth = (category.planned / maxValue) * 100;
        const actualWidth = (category.actual / maxValue) * 100;
        const isOverBudget = category.actual > category.planned;
        const percentage = category.planned > 0 
          ? Math.round((category.actual / category.planned) * 100) 
          : 0;

        return (
          <motion.div
            key={category.id}
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg ${info.color} flex items-center justify-center`}>
                  <info.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-medium text-sm text-foreground">{info.label}</span>
              </div>
              {showLabels && (
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${isOverBudget ? "text-destructive" : "text-foreground"}`}>
                    {percentage}%
                  </span>
                </div>
              )}
            </div>

            <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
              {/* Planned bar (background) */}
              <motion.div
                className="absolute inset-y-0 left-0 bg-muted-foreground/20 rounded-lg"
                initial={{ width: 0 }}
                animate={{ width: `${plannedWidth}%` }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
              />
              
              {/* Actual bar (foreground) */}
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-lg ${
                  isOverBudget ? "bg-destructive" : info.color
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${actualWidth}%` }}
                transition={{ duration: 0.8, delay: index * 0.08 + 0.2 }}
              />

              {/* Values */}
              <div className="absolute inset-0 flex items-center justify-between px-3">
                <span className="text-xs font-medium text-white drop-shadow-md">
                  R$ {category.actual.toFixed(0)}
                </span>
                <span className="text-xs text-muted-foreground">
                  / R$ {category.planned.toFixed(0)}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Mini version for dashboard
export const BudgetComparisonMini = ({ categories }: { categories: BudgetCategory[] }) => {
  return (
    <div className="space-y-3">
      {categories.slice(0, 4).map((category, index) => {
        const info = getCategoryInfo(category.id);
        const percentage = category.planned > 0 
          ? Math.min((category.actual / category.planned) * 100, 100)
          : 0;
        const isOverBudget = category.actual > category.planned;

        return (
          <motion.div
            key={category.id}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`w-8 h-8 rounded-lg ${info.color} flex items-center justify-center shrink-0`}>
              <info.icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground truncate">{info.label}</span>
              <span className={`text-xs font-semibold ${isOverBudget ? "text-destructive" : "text-muted-foreground"}`}>
                  {category.planned > 0 ? Math.round((category.actual / category.planned) * 100) : 0}%
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${isOverBudget ? "bg-destructive" : info.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
