import { X, Home, Utensils, Car, Heart, ShoppingBag, Plane, BookOpen, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

/* Categories with required icon/color for compatibility */
const categories = [
  { id: "Moradia", label: "Moradia", icon: Home, color: "bg-muted" },
  { id: "Alimentação", label: "Alimentação", icon: Utensils, color: "bg-muted" },
  { id: "Transporte", label: "Transporte", icon: Car, color: "bg-muted" },
  { id: "Saúde", label: "Saúde", icon: Heart, color: "bg-muted" },
  { id: "Vestuário", label: "Vestuário", icon: ShoppingBag, color: "bg-muted" },
  { id: "Lazer", label: "Lazer", icon: Plane, color: "bg-muted" },
  { id: "Educação", label: "Educação", icon: BookOpen, color: "bg-muted" },
  { id: "Outros", label: "Outros", icon: MoreHorizontal, color: "bg-muted" },
];

interface CategoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (categoryId: string) => void;
  transaction?: {
    merchant: string;
    amount: number;
    date: string;
  };
}

export const CategoryPopup = ({ isOpen, onClose, onSelect, transaction }: CategoryPopupProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card rounded-md border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-body font-medium text-foreground">Categorizar</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {transaction && (
          <div className="mb-4 pb-4 border-b border-border">
            <p className="text-body font-medium text-foreground">{transaction.merchant}</p>
            <p className="text-caption text-muted-foreground">
              R$ {transaction.amount.toFixed(2)} · {transaction.date}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-4">
          {categories.map((category) => (
            <button
              key={category.id}
              className="p-3 rounded-md bg-muted hover:bg-foreground hover:text-background text-left text-body transition-colors"
              onClick={() => onSelect(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        <Button variant="outline" className="w-full" onClick={() => onSelect("interno")}>
          Movimentação interna
        </Button>
      </div>
    </div>
  );
};

export const getCategoryInfo = (id: string) => {
  return categories.find(c => c.id === id) || categories[7];
};

export { categories };
