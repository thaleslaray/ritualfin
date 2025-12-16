import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Upload, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BudgetComparisonMini } from "@/components/budget/BudgetComparison";
import { RitualBadge } from "@/components/brand/Logo";
import { Link } from "react-router-dom";

// Sample data
const currentMonth = {
  name: "Dezembro 2024",
  isClosed: true,
  totalPlanned: 8500,
  totalActual: 7234,
  daysRemaining: 16,
};

const budgetCategories = [
  { id: "moradia", planned: 2500, actual: 2500 },
  { id: "alimentacao", planned: 1800, actual: 1650 },
  { id: "transporte", planned: 800, actual: 920 },
  { id: "saude", planned: 400, actual: 280 },
  { id: "compras", planned: 1200, actual: 1100 },
  { id: "lazer", planned: 600, actual: 520 },
  { id: "tecnologia", planned: 500, actual: 264 },
  { id: "outros", planned: 700, actual: 0 },
];

const pendingTransactions = 5;
const lastUpload = "há 2 dias";

const Index = () => {
  const savingsAmount = currentMonth.totalPlanned - currentMonth.totalActual;
  const savingsPercentage = Math.round((savingsAmount / currentMonth.totalPlanned) * 100);
  const isPositive = savingsAmount >= 0;

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
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                {currentMonth.name}
              </h1>
              {currentMonth.isClosed && <RitualBadge />}
            </div>
            <p className="text-muted-foreground">
              {currentMonth.daysRemaining} dias restantes no mês
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
                      R$ {currentMonth.totalPlanned.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Real</p>
                    <p className="text-xl font-bold text-foreground">
                      R$ {currentMonth.totalActual.toLocaleString('pt-BR')}
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
                        {isPositive ? "+" : ""}R$ {savingsAmount.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Budget bars */}
                <BudgetComparisonMini categories={budgetCategories} />
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
