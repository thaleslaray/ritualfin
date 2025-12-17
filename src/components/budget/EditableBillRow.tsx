import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RecurringBill } from "@/hooks/useRecurringBills";

interface EditableBillRowProps {
  bill: RecurringBill;
  index: number;
  isLocked: boolean;
  isEditingLocked?: boolean;
  onUpdate: (id: string, updates: Partial<RecurringBill>) => void;
  onDelete: (id: string) => void;
  isUpdating?: boolean;
}

export function EditableBillRow({ 
  bill, 
  index, 
  isLocked, 
  isEditingLocked = false,
  onUpdate, 
  onDelete,
  isUpdating 
}: EditableBillRowProps) {
  const isDisabled = isLocked && !isEditingLocked;
  // Local state for smooth typing
  const [name, setName] = useState(bill.name);
  const [amount, setAmount] = useState(bill.amount.toString());
  const [dueDay, setDueDay] = useState(bill.due_day.toString());

  // Sync with prop changes (e.g., after server update)
  useEffect(() => {
    setName(bill.name);
    setAmount(bill.amount.toString());
    setDueDay(bill.due_day.toString());
  }, [bill.name, bill.amount, bill.due_day]);

  const handleBlurName = () => {
    if (name !== bill.name && name.trim()) {
      onUpdate(bill.id, { name: name.trim() });
    }
  };

  const handleBlurAmount = () => {
    const newAmount = parseFloat(amount) || 0;
    if (newAmount !== bill.amount) {
      onUpdate(bill.id, { amount: newAmount });
    }
  };

  const handleBlurDueDay = () => {
    const newDueDay = parseInt(dueDay) || 1;
    if (newDueDay !== bill.due_day) {
      onUpdate(bill.id, { due_day: Math.min(Math.max(newDueDay, 1), 31) });
    }
  };

  return (
    <motion.div
      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Input
        value={name}
        className="flex-1 bg-transparent border-0 font-medium"
        disabled={isDisabled}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleBlurName}
      />
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">R$</span>
        <Input
          type="number"
          value={amount}
          className="w-24 bg-card border-border"
          disabled={isDisabled}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={handleBlurAmount}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Dia</span>
        <Input
          type="number"
          value={dueDay}
          className="w-16 bg-card border-border"
          disabled={isDisabled}
          onChange={(e) => setDueDay(e.target.value)}
          onBlur={handleBlurDueDay}
        />
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        disabled={isDisabled || isUpdating}
        onClick={() => onDelete(bill.id)}
      >
        {isUpdating ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : (
          <Trash2 className="w-4 h-4 text-muted-foreground" />
        )}
      </Button>
    </motion.div>
  );
}
