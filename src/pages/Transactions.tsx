import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  Inbox as InboxIcon, 
  Filter, 
  CheckCircle2, 
  AlertTriangle,
  Search
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TransactionList, Transaction } from "@/components/transactions/TransactionList";
import { CategoryPopup } from "@/components/transactions/CategoryPopup";
import { toast } from "sonner";

// Sample transactions
const mockTransactions: Transaction[] = [
  { id: "1", merchant: "SUPERMERCADO EXTRA", amount: 234.50, date: "12 Dez", category: undefined, confidence: "low", source: "print", needsReview: true },
  { id: "2", merchant: "UBER *TRIP", amount: 28.90, date: "11 Dez", category: "transporte", confidence: "high", source: "print", needsReview: false },
  { id: "3", merchant: "NETFLIX.COM", amount: 55.90, date: "10 Dez", category: "lazer", confidence: "high", source: "ofx", needsReview: false },
  { id: "4", merchant: "FARMACIA DROGASIL", amount: 89.00, date: "10 Dez", category: undefined, confidence: "medium", source: "print", needsReview: true },
  { id: "5", merchant: "PIX RECEBIDO JOAO", amount: 500.00, date: "09 Dez", category: undefined, confidence: "low", source: "ofx", needsReview: true },
  { id: "6", merchant: "RESTAURANTE OUTBACK", amount: 189.00, date: "08 Dez", category: "alimentacao", confidence: "high", source: "print", needsReview: false },
  { id: "7", merchant: "AMAZON BR", amount: 156.90, date: "07 Dez", category: undefined, confidence: "medium", source: "print", needsReview: true },
  { id: "8", merchant: "POSTO SHELL", amount: 200.00, date: "06 Dez", category: "transporte", confidence: "high", source: "ofx", needsReview: false },
];

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [filter, setFilter] = useState<"all" | "pending">("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = filter === "all" || (filter === "pending" && t.needsReview);
    const matchesSearch = t.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = transactions.filter(t => t.needsReview).length;

  const handleCategorySelect = (categoryId: string) => {
    if (!selectedTransaction) return;

    setTransactions(prev => prev.map(t => 
      t.id === selectedTransaction.id 
        ? { ...t, category: categoryId, needsReview: false, confidence: "high" as const }
        : t
    ));

    toast.success("Transação categorizada!", {
      description: categoryId === "interno" 
        ? "Marcada como movimentação interna" 
        : `Categoria: ${categoryId}`,
      action: {
        label: "Desfazer",
        onClick: () => {
          setTransactions(prev => prev.map(t => 
            t.id === selectedTransaction.id 
              ? { ...t, category: undefined, needsReview: true, confidence: "low" as const }
              : t
          ));
        },
      },
    });

    setSelectedTransaction(null);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              Transações
            </h1>
            <p className="text-muted-foreground">
              {pendingCount > 0 ? (
                <span className="text-warning-foreground font-medium">
                  {pendingCount} transações aguardando categorização
                </span>
              ) : (
                <span className="text-success">Todas categorizadas!</span>
              )}
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar transação..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className="gap-2"
            >
              <InboxIcon className="w-4 h-4" />
              Todas
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
              className="gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Pendentes
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-warning text-warning-foreground">
                  {pendingCount}
                </span>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Transaction List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {filteredTransactions.length === 0 ? (
            <Card variant="glass" className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Tudo em ordem!
                </h3>
                <p className="text-muted-foreground">
                  {filter === "pending" 
                    ? "Nenhuma transação pendente de categorização."
                    : "Nenhuma transação encontrada."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <TransactionList
              transactions={filteredTransactions}
              onTransactionClick={(t) => t.needsReview && setSelectedTransaction(t)}
            />
          )}
        </motion.div>
      </div>

      {/* Category Popup */}
      <AnimatePresence>
        {selectedTransaction && (
          <CategoryPopup
            isOpen={true}
            onClose={() => setSelectedTransaction(null)}
            onSelect={handleCategorySelect}
            transaction={{
              merchant: selectedTransaction.merchant,
              amount: selectedTransaction.amount,
              date: selectedTransaction.date,
            }}
          />
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Transactions;
