import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Download,
  Loader2,
  FileText,
  CreditCard
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BudgetComparison } from "@/components/budget/BudgetComparison";
import { categories as categoryList } from "@/components/transactions/CategoryPopup";
import { useState } from "react";
import { useCurrentMonth, useCategoryBudgets } from "@/hooks/useMonths";
import { useTransactionsSummary, useTransactionsByCategory, useTransactions } from "@/hooks/useTransactions";
import { useCardUsage } from "@/hooks/useCardUsage";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { exportTransactionsToCsv } from "@/utils/exportCsv";
import { toast } from "sonner";

const Report = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const { data: currentMonth, isLoading: isLoadingMonth } = useCurrentMonth();
  const { data: categoryBudgets = [], isLoading: isLoadingBudgets } = useCategoryBudgets(currentMonth?.id);
  const { data: allTransactions = [] } = useTransactions(currentMonth?.id);
  const summary = useTransactionsSummary(currentMonth?.id);
  const { data: categoryTransactions = [], isLoading: isLoadingCategoryTx } = useTransactionsByCategory(
    currentMonth?.id, 
    expandedCategory
  );
  const { data: cardUsage = [] } = useCardUsage(currentMonth?.id);

  const isLoading = isLoadingMonth || isLoadingBudgets;

  const handleExportCsv = () => {
    if (!currentMonth || !categoryBudgets.length) {
      toast.error("Nenhum dado para exportar");
      return;
    }
    const monthName = formatMonthName(currentMonth.year_month);
    exportTransactionsToCsv(allTransactions, categoryBudgets, monthName);
    toast.success("CSV exportado com sucesso!");
  };

  // Build report data from real data
  const categories = categoryBudgets.map(budget => ({
    id: budget.category,
    planned: Number(budget.planned_amount),
    actual: summary.byCategory[budget.category] || 0,
  }));

  const totalPlanned = categories.reduce((sum, c) => sum + c.planned, 0);
  const totalActual = summary.total;
  const overBudgetCategories = categories.filter(c => c.actual > c.planned).map(c => c.id);

  const savings = totalPlanned - totalActual;
  const savingsPercentage = totalPlanned > 0 ? Math.round((savings / totalPlanned) * 100) : 0;
  const isPositive = savings >= 0;

  const getCategoryInfo = (id: string) => {
    return categoryList.find(c => c.id === id);
  };

  const formatMonthName = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return format(date, "MMMM yyyy", { locale: ptBR });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!currentMonth) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <Card variant="glass" className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum mês criado
              </h3>
              <p className="text-muted-foreground">
                Crie um mês na página de Orçamento para ver o relatório.
              </p>
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
              Relatório {formatMonthName(currentMonth.year_month)}
            </h1>
            <p className="text-muted-foreground">
              Planejado vs Real por categoria
              {currentMonth.edited_after_close && (
                <span className="ml-2 text-warning-foreground text-sm">
                  (editado após fechamento)
                </span>
              )}
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleExportCsv}>
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
            <Card variant={isPositive ? "glass" : "glass"} className={isPositive ? "border-success/30" : "border-destructive/30"}>
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
        {categories.length > 0 && (
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
                <BudgetComparison categories={categories} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Card Limits */}
        {cardUsage.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Teto dos Cartões
                </CardTitle>
                <CardDescription>
                  Acompanhe o uso vs limite de cada cartão
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cardUsage.map((card, index) => (
                  <motion.div
                    key={card.cardId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + index * 0.05 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{card.cardName}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${card.isOverLimit ? "text-destructive" : "text-foreground"}`}>
                          R$ {card.totalSpent.toLocaleString('pt-BR')} / R$ {card.monthlyLimit.toLocaleString('pt-BR')}
                        </span>
                        {card.isOverLimit && (
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={Math.min(card.percentage, 100)} 
                        className={`h-2 ${card.isOverLimit ? "[&>div]:bg-destructive" : ""}`}
                      />
                      {card.isOverLimit && (
                        <div 
                          className="absolute top-0 h-2 w-0.5 bg-destructive" 
                          style={{ left: `${(card.monthlyLimit / card.totalSpent) * 100}%` }}
                        />
                      )}
                    </div>
                    <p className={`text-xs ${card.isOverLimit ? "text-destructive" : "text-muted-foreground"}`}>
                      {card.percentage}% do limite {card.isOverLimit && `(+R$ ${(card.totalSpent - card.monthlyLimit).toLocaleString('pt-BR')} acima)`}
                    </p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Category Details */}
        {categories.length > 0 && (
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
                {categories.map((category, index) => {
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
                          {isLoadingCategoryTx ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            </div>
                          ) : categoryTransactions.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Nenhuma transação nesta categoria
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {categoryTransactions.map(tx => (
                                <div key={tx.id} className="flex items-center justify-between py-2 px-3 bg-background/50 rounded-lg">
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{tx.merchant}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {format(new Date(tx.transaction_date), "dd/MM/yyyy", { locale: ptBR })}
                                    </p>
                                  </div>
                                  <p className="text-sm font-semibold text-foreground">
                                    R$ {Number(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {categories.length === 0 && (
          <Card variant="glass" className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">
                Nenhuma categoria configurada para este mês.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Report;
