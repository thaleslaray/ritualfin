import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { 
  Inbox as InboxIcon, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  Loader2
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TransactionList, Transaction as TransactionUI } from "@/components/transactions/TransactionList";
import { CategoryPopup } from "@/components/transactions/CategoryPopup";
import { toast } from "sonner";
import { useCurrentMonth } from "@/hooks/useMonths";
import { 
  useTransactions, 
  usePendingTransactions, 
  useCategorizeTransaction,
  Transaction 
} from "@/hooks/useTransactions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Transactions = () => {
  const { data: currentMonth, isLoading: isLoadingMonth } = useCurrentMonth();
  const { data: transactions = [], isLoading: isLoadingTransactions } = useTransactions(currentMonth?.id);
  const { data: pendingTransactions = [] } = usePendingTransactions(currentMonth?.id);
  const categorizeTransaction = useCategorizeTransaction();
  
  const [filter, setFilter] = useState<"all" | "pending">("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const undoRef = useRef<{ id: string; category: string | null; isInternal: boolean } | null>(null);

  const isLoading = isLoadingMonth || isLoadingTransactions;

  const mapToUI = (t: Transaction): TransactionUI => ({
    id: t.id,
    merchant: t.merchant,
    amount: Number(t.amount),
    date: format(new Date(t.transaction_date), "dd MMM", { locale: ptBR }),
    category: t.category || undefined,
    confidence: t.confidence,
    source: t.source === "manual" ? "print" : t.source,
    needsReview: t.needs_review,
  });

  const displayTransactions = filter === "pending" 
    ? pendingTransactions.map(mapToUI)
    : transactions.map(mapToUI);

  const filteredTransactions = displayTransactions.filter(t => 
    t.merchant.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = pendingTransactions.length;

  const handleCategorySelect = (categoryId: string) => {
    if (!selectedTransaction) return;

    const isInternalTransfer = categoryId === "interno";
    const previousCategory = selectedTransaction.category;
    const previousIsInternal = selectedTransaction.is_internal_transfer;
    
    undoRef.current = {
      id: selectedTransaction.id,
      category: previousCategory,
      isInternal: previousIsInternal,
    };

    categorizeTransaction.mutate(
      {
        transactionId: selectedTransaction.id,
        category: isInternalTransfer ? null : categoryId,
        isInternalTransfer,
      },
      {
        onSuccess: () => {
          toast.success("Categorizado!", {
            description: isInternalTransfer 
              ? "Movimentação interna" 
              : categoryId,
            action: {
              label: "Desfazer",
              onClick: () => {
                if (undoRef.current) {
                  categorizeTransaction.mutate({
                    transactionId: undoRef.current.id,
                    category: undoRef.current.category,
                    isInternalTransfer: undoRef.current.isInternal,
                  });
                }
              },
            },
            duration: 5000,
          });
        },
      }
    );

    setSelectedTransaction(null);
  };

  const handleTransactionClick = (t: TransactionUI) => {
    if (t.needsReview) {
      const fullTransaction = transactions.find(tx => tx.id === t.id);
      if (fullTransaction) {
        setSelectedTransaction(fullTransaction);
      }
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!currentMonth) {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto">
          <Card className="text-center py-16">
            <CardContent>
              <InboxIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-title text-foreground mb-2">
                Nenhum mês criado
              </h3>
              <p className="text-body text-muted-foreground">
                Crie um mês na página de Orçamento.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-display text-foreground mb-2">
            Transações
          </h1>
          <p className="text-body text-muted-foreground">
            {pendingCount > 0 ? (
              <span className="text-warning font-medium">
                {pendingCount} aguardando categorização
              </span>
            ) : (
              <span className="text-success">Todas categorizadas</span>
            )}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              Todas
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
              className="gap-2"
            >
              Pendentes
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-warning text-warning-foreground">
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
            <Card className="text-center py-16">
              <CardContent>
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-title text-foreground mb-2">
                  {transactions.length === 0 ? "Nenhuma transação" : "Tudo em ordem"}
                </h3>
                <p className="text-body text-muted-foreground">
                  {transactions.length === 0
                    ? "Faça upload de extratos para importar."
                    : "Nenhuma transação pendente."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <TransactionList
              transactions={filteredTransactions}
              onTransactionClick={handleTransactionClick}
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
              amount: Number(selectedTransaction.amount),
              date: format(new Date(selectedTransaction.transaction_date), "dd MMM", { locale: ptBR }),
            }}
          />
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Transactions;
