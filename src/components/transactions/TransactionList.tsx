import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { getCategoryInfo } from "@/components/transactions/CategoryPopup";

export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  category?: string;
  confidence: "high" | "medium" | "low";
  source: "print" | "ofx" | "manual";
  needsReview: boolean;
}

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionClick: (transaction: Transaction) => void;
}

export const TransactionList = ({ transactions, onTransactionClick }: TransactionListProps) => {
  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return (
          <div className="flex items-center gap-1 text-success text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Alta</span>
          </div>
        );
      case "medium":
        return (
          <div className="flex items-center gap-1 text-warning-foreground text-xs">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Média</span>
          </div>
        );
      case "low":
        return (
          <div className="flex items-center gap-1 text-destructive text-xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Baixa</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      {transactions.map((transaction, index) => {
        const categoryInfo = transaction.category ? getCategoryInfo(transaction.category) : null;
        
        return (
          <motion.div
            key={transaction.id}
            className={`p-4 rounded-xl bg-card border transition-all duration-200 cursor-pointer hover:shadow-md ${
              transaction.needsReview 
                ? "border-warning/50 bg-warning/5" 
                : "border-border hover:border-primary/30"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onTransactionClick(transaction)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {categoryInfo ? (
                  <div className={`w-10 h-10 rounded-xl ${categoryInfo.color} flex items-center justify-center`}>
                    <categoryInfo.icon className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground">{transaction.merchant}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{transaction.date}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground uppercase">{transaction.source}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">
                  R$ {transaction.amount.toFixed(2)}
                </p>
                <div className="mt-1">
                  {getConfidenceBadge(transaction.confidence)}
                </div>
              </div>
            </div>
            
            {transaction.needsReview && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-warning-foreground flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Toque para categorizar
                </p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
