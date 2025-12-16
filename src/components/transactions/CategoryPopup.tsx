import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  Home, 
  Car, 
  Utensils, 
  Heart, 
  Smartphone, 
  Plane, 
  MoreHorizontal,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { id: "moradia", label: "Moradia", icon: Home, color: "bg-blue-500" },
  { id: "alimentacao", label: "Alimentação", icon: Utensils, color: "bg-orange-500" },
  { id: "transporte", label: "Transporte", icon: Car, color: "bg-green-500" },
  { id: "saude", label: "Saúde", icon: Heart, color: "bg-red-500" },
  { id: "compras", label: "Compras", icon: ShoppingBag, color: "bg-purple-500" },
  { id: "lazer", label: "Lazer", icon: Plane, color: "bg-cyan-500" },
  { id: "tecnologia", label: "Tecnologia", icon: Smartphone, color: "bg-indigo-500" },
  { id: "outros", label: "Outros", icon: MoreHorizontal, color: "bg-gray-500" },
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
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border overflow-hidden"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Categorizar transação</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {transaction && (
            <div className="bg-muted rounded-xl p-4">
              <p className="font-medium text-foreground">{transaction.merchant}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-muted-foreground">{transaction.date}</span>
                <span className="font-semibold text-foreground">
                  R$ {transaction.amount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Categories Grid */}
        <div className="p-6">
          <p className="text-sm text-muted-foreground mb-4">Toque para categorizar:</p>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                className="category-chip flex items-center gap-3 bg-muted hover:bg-primary hover:text-primary-foreground border border-border/50 hover:border-primary/50 text-left"
                onClick={() => onSelect(category.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center`}>
                  <category.icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">{category.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => onSelect("interno")}
          >
            Marcar como movimentação interna
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const getCategoryInfo = (id: string) => {
  return categories.find(c => c.id === id) || categories[7];
};

export { categories };
