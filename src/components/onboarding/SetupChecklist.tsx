import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Circle,
  Sparkles,
  Upload,
  ListChecks,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SetupChecklistProps {
  hasMonth: boolean;
  hasBudget: boolean;
  hasUploads: boolean;
  hasAllCategorized: boolean;
}

export const SetupChecklist = ({ 
  hasMonth, 
  hasBudget, 
  hasUploads, 
  hasAllCategorized 
}: SetupChecklistProps) => {
  const items: ChecklistItem[] = [
    {
      id: "month",
      label: "Criar orçamento do mês",
      description: "Defina quanto vão gastar em cada categoria",
      completed: hasMonth && hasBudget,
      href: "/budget",
      icon: Sparkles,
    },
    {
      id: "upload",
      label: "Enviar primeiro extrato",
      description: "Print do cartão ou arquivo OFX",
      completed: hasUploads,
      href: "/uploads",
      icon: Upload,
    },
    {
      id: "categorize",
      label: "Categorizar transações",
      description: "Classifique cada gasto em uma categoria",
      completed: hasAllCategorized,
      href: "/transactions",
      icon: ListChecks,
    },
  ];

  const completedCount = items.filter(i => i.completed).length;
  const progress = (completedCount / items.length) * 100;

  // Don't show if all completed
  if (completedCount === items.length) return null;

  return (
    <motion.div
      className="bg-card border border-border rounded-2xl p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Primeiros Passos</h3>
        <span className="text-sm text-muted-foreground">
          {completedCount}/{items.length} completos
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <Link key={item.id} to={item.href}>
            <motion.div
              className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                item.completed 
                  ? "bg-muted/50" 
                  : "bg-primary/5 hover:bg-primary/10 cursor-pointer"
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                item.completed ? "bg-success/10" : "bg-primary/10"
              }`}>
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <item.icon className="w-5 h-5 text-primary" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${
                  item.completed ? "text-muted-foreground line-through" : "text-foreground"
                }`}>
                  {item.label}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {item.description}
                </p>
              </div>

              {!item.completed && (
                <ChevronRight className="w-5 h-5 text-primary shrink-0" />
              )}
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};