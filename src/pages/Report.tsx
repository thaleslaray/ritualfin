import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Download
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BudgetComparison } from "@/components/budget/BudgetComparison";
import { categories as categoryList } from "@/components/transactions/CategoryPopup";
import { useState } from "react";

// Sample data
const reportData = {
  month: "Dezembro 2024",
  totalPlanned: 8500,
  totalActual: 7234,
  categories: [
    { id: "moradia", planned: 2500, actual: 2500 },
    { id: "alimentacao", planned: 1800, actual: 1650 },
    { id: "transporte", planned: 800, actual: 920 },
    { id: "saude", planned: 400, actual: 280 },
    { id: "compras", planned: 1200, actual: 1100 },
    { id: "lazer", planned: 600, actual: 520 },
    { id: "tecnologia", planned: 500, actual: 264 },
    { id: "outros", planned: 700, actual: 0 },
  ],
  overBudgetCategories: ["transporte"],
  editedAfterClose: false,
};

const Report = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const savings = reportData.totalPlanned - reportData.totalActual;
  const savingsPercentage = Math.round((savings / reportData.totalPlanned) * 100);
  const isPositive = savings >= 0;

  const getCategoryInfo = (id: string) => {
    return categoryList.find(c => c.id === id);
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
              Relatório {reportData.month}
            </h1>
            <p className="text-muted-foreground">
              Planejado vs Real por categoria
            </p>
          </div>
          <Button variant="outline" className="gap-2">
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
                  R$ {reportData.totalPlanned.toLocaleString('pt-BR')}
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
                  R$ {reportData.totalActual.toLocaleString('pt-BR')}
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
                    {isPositive ? "+" : ""}R$ {savings.toLocaleString('pt-BR')}
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
        {reportData.overBudgetCategories.length > 0 && (
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
                      {reportData.overBudgetCategories.map(id => getCategoryInfo(id)?.label).join(", ")} 
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
              <BudgetComparison categories={reportData.categories} />
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
              {reportData.categories.map((category, index) => {
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
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Transações desta categoria serão listadas aqui após integração com banco de dados
                        </p>
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
