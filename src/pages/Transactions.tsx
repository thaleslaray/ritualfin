import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  Inbox as InboxIcon, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  Loader2,
  FileUp
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TransactionList, Transaction } from "@/components/transactions/TransactionList";
import { CategoryPopup } from "@/components/transactions/CategoryPopup";
import { toast } from "sonner";
import { useCurrentMonth } from "@/hooks/useMonths";
import { useTransactions, useUpdateTransaction } from "@/hooks/useTransactions";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Transactions = () => {
  const { data: currentMonth, isLoading: isLoadingMonth } = useCurrentMonth();
  const { data: dbTransactions, isLoading: isLoadingTransactions } = useTransactions(currentMonth?.id);
  const updateTransaction = useUpdateTransaction();
  
  const [filter, setFilter] = useState<"all" | "pending">("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const isLoading = isLoadingMonth || isLoadingTransactions;

  // Map DB transactions to component format
  const transactions: Transaction[] = (dbTransactions || []).map(t => ({
    id: t.id,
    merchant: t.merchant,
    amount: Number(t.amount),
    date: format(new Date(t.transaction_date), "dd MMM", { locale: ptBR }),
    category: t.category || undefined,
    confidence: t.confidence || "low",
    source: t.source,
    needsReview: t.needs_review || false,
  }));

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = filter === "all" || (filter === "pending" && t.needsReview);
    const matchesSearch = t.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = transactions.filter(t => t.needsReview).length;

  const handleCategorySelect = async (categoryId: string) => {
    if (!selectedTransaction) return;

    const isInternal = categoryId === "interno";
    
    try {
      await updateTransaction.mutateAsync({
        id: selectedTransaction.id,
        category: isInternal ? null : categoryId,
        is_internal_transfer: isInternal,
        needs_review: false,
        confidence: "high",
      });

      toast.success("Transação categorizada!", {
        description: isInternal 
          ? "Marcada como movimentação interna" 
          : `Categoria: ${categoryId}`,
      });
    } catch (error) {
      toast.error("Erro ao categorizar transação");
    }

    setSelectedTransaction(null);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

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
              ) : transactions.length > 0 ? (
                <span className="text-success">Todas categorizadas!</span>
              ) : (
                <span>Nenhuma transação importada</span>
              )}
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        {transactions.length > 0 && (
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
        )}

        {/* Transaction List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {transactions.length === 0 ? (
            <Card variant="glass" className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <FileUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma transação ainda
                </h3>
                <p className="text-muted-foreground mb-4">
                  Faça o upload de prints ou arquivos OFX para importar transações.
                </p>
                <Link to="/uploads">
                  <Button variant="hero">Fazer Upload</Button>
                </Link>
              </CardContent>
            </Card>
          ) : filteredTransactions.length === 0 ? (
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
