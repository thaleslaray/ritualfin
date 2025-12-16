import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Download,
  Loader2,
  FileUp
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BudgetComparison } from "@/components/budget/BudgetComparison";
import { categories as categoryList } from "@/components/transactions/CategoryPopup";
import { useState } from "react";
import { useCurrentMonth, useCategoryBudgets } from "@/hooks/useMonths";
import { useTransactions } from "@/hooks/useTransactions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

const Report = () => {
  const { data: currentMonth, isLoading: isLoadingMonth } = useCurrentMonth();
  const { data: categoryBudgets, isLoading: isLoadingBudgets } = useCategoryBudgets(currentMonth?.id);
  const { data: transactions, isLoading: isLoadingTransactions } = useTransactions(currentMonth?.id);

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const isLoading = isLoadingMonth || isLoadingBudgets || isLoadingTransactions;

  // Calculate category data
  const categoryData = categoryBudgets?.map(cat => {
    const categoryTransactions = transactions?.filter(
      t => t.category === cat.category && !t.is_internal_transfer && !t.is_card_payment
    ) || [];
    const actual = categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    return {
      id: cat.category,
      planned: Number(cat.planned_amount),
      actual,
      transactions: categoryTransactions,
    };
  }) || [];

  const totalPlanned = categoryData.reduce((sum, cat) => sum + cat.planned, 0);
  const totalActual = categoryData.reduce((sum, cat) => sum + cat.actual, 0);
  const overBudgetCategories = categoryData.filter(cat => cat.actual > cat.planned).map(cat => cat.id);

  const monthName = currentMonth?.year_month 
    ? format(new Date(currentMonth.year_month + "-01"), "MMMM yyyy", { locale: ptBR })
    : format(new Date(), "MMMM yyyy", { locale: ptBR });
  
  const savings = totalPlanned - totalActual;
  const savingsPercentage = totalPlanned > 0 ? Math.round((savings / totalPlanned) * 100) : 0;
  const isPositive = savings >= 0;

  const getCategoryInfo = (id: string) => {
    return categoryList.find(c => c.id === id);
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

  if (!currentMonth || categoryData.length === 0) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <Card variant="glass" className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum orçamento configurado
              </h3>
              <p className="text-muted-foreground mb-4">
                Configure o orçamento do mês para ver o relatório.
              </p>
              <Link to="/budget">
                <Button variant="hero">Configurar Orçamento</Button>
              </Link>
            </CardContent>
          </Card>
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
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2 capitalize">
              Relatório {monthName}
            </h1>
            <p className="text-muted-foreground">
              Planejado vs Real por categoria
            </p>
          </div>
          <Button variant="outline" className="gap-2" disabled>
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Total Planejado</p>
                <p className="text-3xl font-bold text-foreground">
                  R$ {totalPlanned.toLocaleString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Total Real</p>
                <p className="text-3xl font-bold text-foreground">
                  R$ {totalActual.toLocaleString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="glass" className={isPositive ? "border-success/30" : "border-destructive/30"}>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Saldo</p>
                <div className="flex items-center justify-center gap-2">
                  {isPositive ? (
                    <TrendingUp className="w-6 h-6 text-success" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-destructive" />
                  )}
                  <p className={`text-3xl font-bold ${isPositive ? "text-success" : "text-destructive"}`}>
                    {isPositive ? "+" : ""}R$ {Math.abs(savings).toLocaleString('pt-BR')}
                  </p>
                </div>
                <p className={`text-sm mt-1 ${isPositive ? "text-success" : "text-destructive"}`}>
                  {savingsPercentage}% {isPositive ? "economizado" : "acima"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Alerts */}
        {overBudgetCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="glass" className="border-warning/50 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning-foreground shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      Categorias acima do orçamento
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {overBudgetCategories.map(id => getCategoryInfo(id)?.label).join(", ")} 
                      {" "}ultrapassaram o planejado este mês
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Budget Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Planejado vs Real</CardTitle>
              <CardDescription>
                Comparação por categoria com indicadores de estouro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BudgetComparison categories={categoryData} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Detalhes por Categoria</CardTitle>
              <CardDescription>
                Clique para ver as transações de cada categoria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {categoryData.map((category, index) => {
                const info = getCategoryInfo(category.id);
                if (!info) return null;
                
                const isOverBudget = category.actual > category.planned;
                const percentage = category.planned > 0 
                  ? Math.round((category.actual / category.planned) * 100)
                  : 0;
                const isExpanded = expandedCategory === category.id;

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                  >
                    <button
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        isExpanded ? "bg-muted" : "bg-muted/50 hover:bg-muted"
                      }`}
                      onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${info.color} flex items-center justify-center`}>
                            <info.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{info.label}</p>
                            <p className="text-sm text-muted-foreground">
                              R$ {category.actual.toLocaleString('pt-BR')} / R$ {category.planned.toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-semibold ${isOverBudget ? "text-destructive" : "text-success"}`}>
                            {percentage}%
                          </span>
                          {isOverBudget ? (
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          )}
                          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-muted/30 rounded-b-xl -mt-2 pt-6"
                      >
                        {category.transactions.length > 0 ? (
                          <div className="space-y-2">
                            {category.transactions.map(t => (
                              <div key={t.id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t.merchant}</span>
                                <span className="font-medium">R$ {Number(t.amount).toLocaleString('pt-BR')}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Nenhuma transação nesta categoria
                          </p>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Report;
