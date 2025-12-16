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
import { useTransactionsSummary, usePendingTransactions } from "@/hooks/useTransactions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Index = () => {
  const { data: currentMonth, isLoading: monthLoading } = useCurrentMonth();
  const { data: categoryBudgets, isLoading: budgetsLoading } = useCategoryBudgets(currentMonth?.id);
  const summary = useTransactionsSummary(currentMonth?.id);
  const { data: pendingTransactions, isLoading: pendingLoading } = usePendingTransactions(currentMonth?.id);

  const isLoading = monthLoading || budgetsLoading || pendingLoading;

  // Calculate month name
  const getMonthName = () => {
    if (!currentMonth?.year_month) return "Novo Mês";
    const [year, month] = currentMonth.year_month.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return format(date, "MMMM yyyy", { locale: ptBR });
  };

  // Calculate days remaining in month
  const getDaysRemaining = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.getDate() - now.getDate();
  };

  // Calculate totals from category budgets
  const totalPlanned = categoryBudgets?.reduce((sum, cat) => sum + (cat.planned_amount || 0), 0) || 0;
  const totalActual = summary?.total || 0;
  const savingsAmount = totalPlanned - totalActual;
  const isPositive = savingsAmount >= 0;
  const pendingCount = pendingTransactions?.length || 0;

  // Transform category budgets for BudgetComparisonMini
  const budgetCategories = categoryBudgets?.map(cat => ({
    id: cat.category,
    planned: cat.planned_amount || 0,
    actual: summary?.byCategory[cat.category] || 0,
  })) || [];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  // Empty state - no month created yet
  if (!currentMonth) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Bem-vindo ao seu primeiro mês!
            </h1>
            <p className="text-muted-foreground mb-6">
              Comece configurando seu orçamento mensal no Ritual Dia 1. 
              É rápido — leva menos de 10 minutos.
            </p>
            <Link to="/budget">
              <Button variant="hero" size="lg" className="gap-2">
                <Sparkles className="w-5 h-5" />
                Começar Ritual Dia 1
              </Button>
            </Link>
          </motion.div>
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
                {getMonthName()}
              </h1>
              {currentMonth.closed_at && <RitualBadge />}
            </div>
            <p className="text-muted-foreground">
              {getDaysRemaining()} dias restantes no mês
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
                  <p className="text-center text-muted-foreground py-4">
                    Configure suas categorias no Ritual Dia 1
                  </p>
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
                          Envie prints e OFX
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
                    pendingCount > 0 ? "border-warning/50" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        pendingCount > 0 
                          ? "bg-warning/10 group-hover:bg-warning/20" 
                          : "bg-success/10 group-hover:bg-success/20"
                      }`}>
                        {pendingCount > 0 ? (
                          <AlertTriangle className="w-6 h-6 text-warning-foreground" />
                        ) : (
                          <CheckCircle2 className="w-6 h-6 text-success" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">Transações</h3>
                        {pendingCount > 0 ? (
                          <p className="text-sm text-warning-foreground font-medium">
                            {pendingCount} pendentes
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
