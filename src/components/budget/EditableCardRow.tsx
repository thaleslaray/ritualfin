import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2, CreditCard, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Card {
  id: string;
  name: string;
  monthly_limit: number;
}

interface EditableCardRowProps {
  card: Card;
  index: number;
  isLocked: boolean;
  isEditingLocked?: boolean;
  onUpdate: (id: string, updates: Partial<Card>) => void;
  onDelete: (id: string) => void;
  isUpdating?: boolean;
}

export function EditableCardRow({
  card,
  index,
  isLocked,
  isEditingLocked = false,
  onUpdate,
  onDelete,
  isUpdating,
}: EditableCardRowProps) {
  const isDisabled = isLocked && !isEditingLocked;

  // Local state for smooth typing
  const [name, setName] = useState(card.name);
  const [limit, setLimit] = useState(card.monthly_limit.toString());

  // Sync with prop changes
  useEffect(() => {
    setName(card.name);
    setLimit(card.monthly_limit.toString());
  }, [card.name, card.monthly_limit]);

  const handleBlurName = () => {
    if (name !== card.name && name.trim()) {
      onUpdate(card.id, { name: name.trim() });
    }
  };

  const handleBlurLimit = () => {
    const newLimit = parseFloat(limit) || 0;
    if (newLimit !== card.monthly_limit) {
      onUpdate(card.id, { monthly_limit: newLimit });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <motion.div
      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
        <CreditCard className="w-5 h-5 text-primary-foreground" />
      </div>
      <Input
        value={name}
        className="flex-1 bg-transparent border-0 font-medium"
        disabled={isDisabled}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleBlurName}
        onKeyDown={handleKeyDown}
      />
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Teto: R$</span>
        <Input
          type="number"
          value={limit}
          className="w-24 bg-card border-border"
          disabled={isDisabled}
          onChange={(e) => setLimit(e.target.value)}
          onBlur={handleBlurLimit}
          onKeyDown={handleKeyDown}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        disabled={isDisabled || isUpdating}
        onClick={() => onDelete(card.id)}
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
