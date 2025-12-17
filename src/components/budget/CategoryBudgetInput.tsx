import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

interface CategoryBudgetInputProps {
  budgetId: string;
  category: string;
  plannedAmount: number;
  isLocked: boolean;
  isEditingLocked: boolean;
  index: number;
  categoryInfo: {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    label: string;
  };
  onUpdate: (id: string, amount: number) => void;
}

export function CategoryBudgetInput({
  budgetId,
  plannedAmount,
  isLocked,
  isEditingLocked,
  index,
  categoryInfo,
  onUpdate,
}: CategoryBudgetInputProps) {
  // Local state for smooth typing
  const [localAmount, setLocalAmount] = useState(plannedAmount.toString());

  // Sync with prop changes (e.g., after server update)
  useEffect(() => {
    setLocalAmount(plannedAmount.toString());
  }, [plannedAmount]);

  const handleBlur = () => {
    const newAmount = parseFloat(localAmount) || 0;
    if (newAmount !== plannedAmount) {
      onUpdate(budgetId, newAmount);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  const Icon = categoryInfo.icon;
  const isDisabled = isLocked && !isEditingLocked;

  return (
    <motion.div
      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04 }}
    >
      <div
        className={`w-10 h-10 rounded-xl ${categoryInfo.color} flex items-center justify-center shrink-0`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="flex-1 font-medium text-foreground">
        {categoryInfo.label}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">R$</span>
        <Input
          type="number"
          value={localAmount}
          className="w-24 bg-card border-border"
          disabled={isDisabled}
          onChange={(e) => setLocalAmount(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </div>
    </motion.div>
  );
}
