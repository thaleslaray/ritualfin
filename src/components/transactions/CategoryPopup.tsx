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
  X,
  ArrowLeftRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { id: "Moradia", label: "Moradia", icon: Home, color: "#007AFF" },
  { id: "Alimentação", label: "Alimentação", icon: Utensils, color: "#FF9500" },
  { id: "Transporte", label: "Transporte", icon: Car, color: "#34C759" },
  { id: "Saúde", label: "Saúde", icon: Heart, color: "#FF2D55" },
  { id: "Vestuário", label: "Vestuário", icon: ShoppingBag, color: "#AF52DE" },
  { id: "Lazer", label: "Lazer", icon: Plane, color: "#5AC8FA" },
  { id: "Educação", label: "Educação", icon: Smartphone, color: "#FFCC00" },
  { id: "Outros", label: "Outros", icon: MoreHorizontal, color: "#8E8E93" },
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
        className="absolute inset-0 bg-foreground/20 backdrop-blur-xl"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
      >
        {/* Handle bar for mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <div className="flex-1" />
          <h3 className="text-title text-foreground text-center">Categorizar</h3>
          <div className="flex-1 flex justify-end">
            <Button variant="ghost" size="icon-sm" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Transaction info */}
        {transaction && (
          <div className="px-6 pb-6">
            <div className="text-center">
              <p className="text-headline text-foreground mb-1">{transaction.merchant}</p>
              <p className="text-display text-foreground font-semibold">
                R$ {transaction.amount.toFixed(2)}
              </p>
              <p className="text-caption text-muted-foreground mt-1">{transaction.date}</p>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                className="flex items-center gap-3 p-4 rounded-2xl bg-muted hover:bg-foreground hover:text-background transition-all duration-300 text-left group"
                onClick={() => onSelect(category.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: category.color }}
                >
                  <category.icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-[15px]">{category.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Footer - Internal transfer */}
        <div className="px-6 pb-8">
          <Button 
            variant="outline" 
            className="w-full h-13 gap-2" 
            onClick={() => onSelect("interno")}
          >
            <ArrowLeftRight className="w-5 h-5" />
            Movimentação interna
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
