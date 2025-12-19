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
import { useState } from "react";
import { useCurrentMonth, useCategoryBudgets } from "@/hooks/useMonths";
import { useTransactionsSummary, useTransactionsByCategory, useTransactions } from "@/hooks/useTransactions";
import { useCardUsage } from "@/hooks/useCardUsage";
import { useCategories } from "@/hooks/useCategories";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { exportTransactionsToCsv } from "@/utils/exportCsv";
import { toast } from "sonner";
import { getCategoryDisplayName } from "@/utils/categoryDisplay";

const Report = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const { data: currentMonth, isLoading: isLoadingMonth } = useCurrentMonth();
  const { data: categoryBudgets = [], isLoading: isLoadingBudgets } = useCategoryBudgets(currentMonth?.id);
  const { data: categoriesLookup } = useCategories();
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
    toast.success("CSV exportado!");
  };

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

  const formatMonthName = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return format(date, "MMMM yyyy", { locale: ptBR });
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
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={1.5} />
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
      <div className="space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-display text-foreground mb-2 capitalize">
              {formatMonthName(currentMonth.year_month)}
            </h1>
            <p className="text-body text-muted-foreground">
              Planejado vs Real
              {currentMonth.edited_after_close && (
                <span className="ml-2 text-warning text-caption">(editado)</span>
              )}
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleExportCsv}>
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </motion.div>

        {/* Hero Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center py-8"
        >
          <p className="text-caption text-muted-foreground mb-2">
            {isPositive ? "Economia" : "Acima do orçamento"}
          </p>
          <div className="flex items-center justify-center gap-3">
            {isPositive ? (
              <TrendingUp className="w-10 h-10 text-success" strokeWidth={1.5} />
            ) : (
              <TrendingDown className="w-10 h-10 text-destructive" strokeWidth={1.5} />
            )}
            <p className={`hero-number ${isPositive ? "text-success" : "text-destructive"}`}>
              R$ {Math.abs(savings).toLocaleString('pt-BR')}
            </p>
          </div>
          <p className={`text-body mt-2 ${isPositive ? "text-success" : "text-destructive"}`}>
            {savingsPercentage}% {isPositive ? "economizado" : "acima"}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="filled">
              <CardContent className="p-6 text-center">
                <p className="text-caption text-muted-foreground mb-1">Planejado</p>
                <p className="text-headline text-foreground">
                  R$ {totalPlanned.toLocaleString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card variant="filled">
              <CardContent className="p-6 text-center">
                <p className="text-caption text-muted-foreground mb-1">Real</p>
                <p className="text-headline text-foreground">
                  R$ {totalActual.toLocaleString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Alerts - Apple style: simple text */}
        {overBudgetCategories.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-caption text-destructive"
          >
            {overBudgetCategories.length === 1 
              ? `${getCategoryDisplayName(overBudgetCategories[0], categoriesLookup)} está acima do orçamento`
              : `${overBudgetCategories.length} categorias acima do orçamento`
            }
          </motion.p>
        )}

        {/* Budget Comparison */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <BudgetComparison categories={categories} categoryLookup={categoriesLookup} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Card Limits */}
        {cardUsage.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Teto dos Cartões</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {cardUsage.map((card, index) => (
                  <motion.div
                    key={card.cardId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-body text-foreground font-medium">{card.cardName}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-caption font-semibold ${card.isOverLimit ? "text-destructive" : "text-foreground"}`}>
                          R$ {card.totalSpent.toLocaleString('pt-BR')} / R$ {card.monthlyLimit.toLocaleString('pt-BR')}
                        </span>
                        {card.isOverLimit && (
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </div>
                    <Progress 
                      value={Math.min(card.percentage, 100)} 
                      className={`h-2 ${card.isOverLimit ? "[&>div]:bg-destructive" : ""}`}
                    />
                    <p className={`text-footnote ${card.isOverLimit ? "text-destructive" : "text-muted-foreground"}`}>
                      {card.percentage}% do limite
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
            transition={{ delay: 0.45 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Detalhes</CardTitle>
                <CardDescription>
                  Toque para ver transações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category, index) => {
                  const label = getCategoryDisplayName(category.id, categoriesLookup);
                  
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
                      transition={{ delay: 0.45 + index * 0.03 }}
                    >
                      <button
                        className="w-full py-4 text-left transition-all duration-200 hover:opacity-70"
                        onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-body text-foreground font-medium">{label}</p>
                            <p className="text-caption text-muted-foreground">
                              R$ {category.actual.toLocaleString('pt-BR')} de R$ {category.planned.toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-caption font-medium ${isOverBudget ? "text-destructive" : "text-muted-foreground"}`}>
                              {percentage}%
                            </span>
                            {isOverBudget && (
                              <AlertTriangle className="w-4 h-4 text-destructive" />
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
                          className="px-4 pb-4 pt-2"
                        >
                          {isLoadingCategoryTx ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            </div>
                          ) : categoryTransactions.length === 0 ? (
                            <p className="text-caption text-muted-foreground text-center py-4">
                              Nenhuma transação
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {categoryTransactions.map(tx => (
                                <div key={tx.id} className="flex items-center justify-between py-3 px-4 bg-background rounded-xl">
                                  <div>
                                    <p className="text-caption text-foreground font-medium">{tx.merchant}</p>
                                    <p className="text-footnote text-muted-foreground">
                                      {format(new Date(tx.transaction_date), "dd/MM", { locale: ptBR })}
                                    </p>
                                  </div>
                                  <p className="text-caption text-foreground font-semibold">
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
          <Card className="text-center py-16">
            <CardContent>
              <p className="text-body text-muted-foreground">
                Nenhuma categoria configurada.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Report;
