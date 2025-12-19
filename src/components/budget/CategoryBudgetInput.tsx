import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

interface CategoryBudgetInputProps {
  budgetId: string;
  categoryKeyOrLegacy: string;
  categoryLabel: string;
  plannedAmount: number;
  isLocked: boolean;
  isEditingLocked: boolean;
  index: number;
  onUpdate: (id: string, amount: number) => void;
}

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

export function CategoryBudgetInput({
  budgetId,
  categoryKeyOrLegacy,
  categoryLabel,
  plannedAmount,
  isLocked,
  isEditingLocked,
  index,
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

  const isDisabled = isLocked && !isEditingLocked;

  return (
    <motion.div
      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04 }}
    >
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: colorFromKey(categoryKeyOrLegacy) }}
      >
        <span className="text-white font-semibold">
          {categoryLabel.slice(0, 1).toUpperCase()}
        </span>
      </div>
      <span className="flex-1 font-medium text-foreground">
        {categoryLabel}
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
