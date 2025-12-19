import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { Category } from "@/hooks/useCategories";
import { getCategoryDisplayName } from "@/utils/categoryDisplay";

const COLOR_PALETTE = [
  "#007AFF",
  "#FF9500",
  "#34C759",
  "#FF2D55",
  "#AF52DE",
  "#5AC8FA",
  "#FFCC00",
  "#8E8E93",
];

function colorFromKey(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return COLOR_PALETTE[h % COLOR_PALETTE.length];
}

interface BudgetCategory {
  id: string;
  planned: number;
  actual: number;
}

interface BudgetComparisonProps {
  categories: BudgetCategory[];
  showLabels?: boolean;
  categoryLookup?: Category[];
}

export const BudgetComparison = ({ categories, categoryLookup }: BudgetComparisonProps) => {
  return (
    <div className="divide-y divide-border">
      {categories.map((category, index) => {
        const label = getCategoryDisplayName(category.id, categoryLookup);
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
                style={{ backgroundColor: colorFromKey(category.id) }}
              >
                <span className="text-white font-semibold">
                  {label.slice(0, 1).toUpperCase()}
                </span>
              </div>
              <p className="text-body text-foreground font-medium">
                {label}
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
export const BudgetComparisonMini = ({
  categories,
  categoryLookup,
}: {
  categories: BudgetCategory[];
  categoryLookup?: Category[];
}) => {
  return (
    <div className="space-y-4">
      {categories.slice(0, 4).map((category, index) => {
        const label = getCategoryDisplayName(category.id, categoryLookup);
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
                  style={{ backgroundColor: colorFromKey(category.id) }}
                >
                  <span className="text-white text-[10px] font-semibold">
                    {label.slice(0, 1).toUpperCase()}
                  </span>
                </div>
                <span className="text-caption text-foreground font-medium">{label}</span>
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
