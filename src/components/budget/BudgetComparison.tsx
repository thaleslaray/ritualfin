import { motion } from "framer-motion";
import { getCategoryInfo } from "@/components/transactions/CategoryPopup";
import { AlertTriangle } from "lucide-react";

interface BudgetCategory {
  id: string;
  planned: number;
  actual: number;
}

interface BudgetComparisonProps {
  categories: BudgetCategory[];
  showLabels?: boolean;
}

export const BudgetComparison = ({ categories }: BudgetComparisonProps) => {
  return (
    <div className="divide-y divide-border">
      {categories.map((category, index) => {
        const info = getCategoryInfo(category.id);
        const percentage = category.planned > 0 
          ? Math.round((category.actual / category.planned) * 100) 
          : 0;
        const isOverBudget = category.actual > category.planned;
        const progressWidth = Math.min(percentage, 100);

        return (
          <motion.div
            key={category.id}
            className="py-5 first:pt-0 last:pb-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {/* Category name with colored icon */}
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: info.color }}
              >
                <info.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-body text-foreground font-medium">
                {info.label}
              </p>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${isOverBudget ? "bg-destructive" : "bg-foreground"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressWidth}%` }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                />
              </div>
              <div className="flex items-center gap-2 min-w-[60px] justify-end">
                <span className={`text-caption font-medium ${isOverBudget ? "text-destructive" : "text-muted-foreground"}`}>
                  {percentage}%
                </span>
                {isOverBudget && (
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                )}
              </div>
            </div>

            {/* Values */}
            <p className="text-caption text-muted-foreground mt-2">
              R$ {category.actual.toLocaleString('pt-BR')} de R$ {category.planned.toLocaleString('pt-BR')}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

// Mini version for dashboard
export const BudgetComparisonMini = ({ categories }: { categories: BudgetCategory[] }) => {
  return (
    <div className="space-y-4">
      {categories.slice(0, 4).map((category, index) => {
        const info = getCategoryInfo(category.id);
        const percentage = category.planned > 0 
          ? Math.min((category.actual / category.planned) * 100, 100)
          : 0;
        const isOverBudget = category.actual > category.planned;

        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: info.color }}
                >
                  <info.icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-caption text-foreground font-medium">{info.label}</span>
              </div>
              <span className={`text-footnote font-medium ${isOverBudget ? "text-destructive" : "text-muted-foreground"}`}>
                {category.planned > 0 ? Math.round((category.actual / category.planned) * 100) : 0}%
              </span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${isOverBudget ? "bg-destructive" : "bg-foreground"}`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
