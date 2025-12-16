import { motion } from "framer-motion";
import { 
  Calendar, 
  Upload, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Loader2
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BudgetComparisonMini } from "@/components/budget/BudgetComparison";
import { RitualBadge } from "@/components/brand/Logo";
import { Link } from "react-router-dom";
import { useCurrentMonth, useCategoryBudgets } from "@/hooks/useMonths";
import { useTransactions } from "@/hooks/useTransactions";
import { useImports } from "@/hooks/useImports";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const Index = () => {
  const { data: currentMonth, isLoading: isLoadingMonth } = useCurrentMonth();
  const { data: categoryBudgets, isLoading: isLoadingBudgets } = useCategoryBudgets(currentMonth?.id);
  const { data: transactions, isLoading: isLoadingTransactions } = useTransactions(currentMonth?.id);
  const { data: imports } = useImports();

  const isLoading = isLoadingMonth || isLoadingBudgets || isLoadingTransactions;

  // Calculate totals
  const totalPlanned = categoryBudgets?.reduce((sum, cat) => sum + Number(cat.planned_amount), 0) || 0;
  const totalActual = transactions
    ?.filter(t => !t.is_internal_transfer && !t.is_card_payment)
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  
  const pendingTransactions = transactions?.filter(t => t.needs_review).length || 0;
  
  const lastImport = imports?.[0];
  const lastUpload = lastImport 
    ? formatDistanceToNow(new Date(lastImport.created_at), { addSuffix: true, locale: ptBR })
    : "nenhum upload";

  // Format month name
  const monthName = currentMonth?.year_month 
    ? format(new Date(currentMonth.year_month + "-01"), "MMMM yyyy", { locale: ptBR })
    : format(new Date(), "MMMM yyyy", { locale: ptBR });

  const daysRemaining = (() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.getDate() - now.getDate();
  })();

  const savingsAmount = totalPlanned - totalActual;
  const isPositive = savingsAmount >= 0;

  // Prepare budget categories for mini comparison
  const budgetCategories = categoryBudgets?.map(cat => {
    const categoryTransactions = transactions?.filter(
      t => t.category === cat.category && !t.is_internal_transfer && !t.is_card_payment
    ) || [];
    const actual = categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    return {
      id: cat.category,
      planned: Number(cat.planned_amount),
      actual,
    };
  }) || [];

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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground capitalize">
                {monthName}
              </h1>
              {currentMonth?.closed_at && <RitualBadge />}
            </div>
            <p className="text-muted-foreground">
              {daysRemaining} dias restantes no mês
            </p>
          </div>
          <Link to="/budget">
            <Button variant="hero" size="lg" className="gap-2">
              <Sparkles className="w-5 h-5" />
              Ritual Dia 1
            </Button>
          </Link>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card variant="glass" className="overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span>Resumo do Mês</span>
                  <Link to="/report">
                    <Button variant="ghost" size="sm" className="gap-1">
                      Ver relatório
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Planejado</p>
                    <p className="text-xl font-bold text-foreground">
                      R$ {totalPlanned.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Real</p>
                    <p className="text-xl font-bold text-foreground">
                      R$ {totalActual.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className={`text-center p-4 rounded-xl ${isPositive ? "bg-success/10" : "bg-destructive/10"}`}>
                    <p className="text-sm text-muted-foreground mb-1">Saldo</p>
                    <div className="flex items-center justify-center gap-1">
                      {isPositive ? (
                        <TrendingUp className="w-5 h-5 text-success" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-destructive" />
                      )}
                      <p className={`text-xl font-bold ${isPositive ? "text-success" : "text-destructive"}`}>
                        {isPositive ? "+" : ""}R$ {Math.abs(savingsAmount).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Budget bars */}
                {budgetCategories.length > 0 ? (
                  <BudgetComparisonMini categories={budgetCategories} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum orçamento definido.</p>
                    <Link to="/budget" className="text-primary hover:underline">
                      Começar o Ritual Dia 1
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Cards */}
          <div className="space-y-4">
            {/* Upload Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/uploads">
                <Card variant="glass" className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">Upload Semanal</h3>
                        <p className="text-sm text-muted-foreground">
                          Último upload: {lastUpload}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-primary text-sm font-medium">
                          <span>Enviar prints</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            {/* Pending Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link to="/transactions">
                <Card 
                  variant="glass" 
                  className={`hover:shadow-lg transition-all duration-300 cursor-pointer group ${
                    pendingTransactions > 0 ? "border-warning/50" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        pendingTransactions > 0 
                          ? "bg-warning/10 group-hover:bg-warning/20" 
                          : "bg-success/10 group-hover:bg-success/20"
                      }`}>
                        {pendingTransactions > 0 ? (
                          <AlertTriangle className="w-6 h-6 text-warning-foreground" />
                        ) : (
                          <CheckCircle2 className="w-6 h-6 text-success" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">Transações</h3>
                        {pendingTransactions > 0 ? (
                          <p className="text-sm text-warning-foreground font-medium">
                            {pendingTransactions} pendentes
                          </p>
                        ) : (
                          <p className="text-sm text-success">Tudo categorizado!</p>
                        )}
                        <div className="flex items-center gap-1 mt-2 text-primary text-sm font-medium">
                          <span>Ver inbox</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            {/* Calendar reminder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card variant="filled" className="border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Próximo ritual</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Quarta-feira</span> - Upload semanal de prints e OFX para manter o relatório atualizado.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
