import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight,
  Loader2,
  ArrowRight,
  Upload,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RitualBadge } from "@/components/brand/Logo";
import { OnboardingWizard, useOnboarding } from "@/components/onboarding/OnboardingWizard";
import { SetupChecklist } from "@/components/onboarding/SetupChecklist";
import { NextStepCard, determineNextStep } from "@/components/onboarding/NextStepCard";
import { Link } from "react-router-dom";
import { useCurrentMonth, useCategoryBudgets } from "@/hooks/useMonths";
import { useTransactionsSummary, usePendingTransactions } from "@/hooks/useTransactions";
import { useImports } from "@/hooks/useImports";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const Index = () => {
  const { showOnboarding, hasChecked, completeOnboarding, skipOnboarding } = useOnboarding();
  const { data: currentMonth, isLoading: monthLoading } = useCurrentMonth();
  const { data: categoryBudgets, isLoading: budgetsLoading } = useCategoryBudgets(currentMonth?.id);
  const summary = useTransactionsSummary(currentMonth?.id);
  const { data: pendingTransactions, isLoading: pendingLoading } = usePendingTransactions(currentMonth?.id);
  const { data: imports } = useImports();

  const isLoading = monthLoading || budgetsLoading || pendingLoading || !hasChecked;

  const getMonthName = () => {
    if (!currentMonth?.year_month) return "Novo Mês";
    const [year, month] = currentMonth.year_month.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return format(date, "MMMM yyyy", { locale: ptBR });
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.getDate() - now.getDate();
  };

  const getWeekOfMonth = () => {
    const now = new Date();
    return Math.min(Math.ceil(now.getDate() / 7), 4);
  };

  const getDaysSinceLastUpload = () => {
    if (!imports || imports.length === 0) return 999;
    const lastImport = imports
      .filter(i => i.status === 'completed')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    if (!lastImport) return 999;
    return differenceInDays(new Date(), new Date(lastImport.created_at));
  };

  const isFirstDayOfMonth = new Date().getDate() <= 5;

  const totalPlanned = categoryBudgets?.reduce((sum, cat) => sum + (cat.planned_amount || 0), 0) || 0;
  const totalActual = summary?.total || 0;
  const savingsAmount = totalPlanned - totalActual;
  const isPositive = savingsAmount >= 0;
  const pendingCount = pendingTransactions?.length || 0;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  const hasBudget = totalPlanned > 0;
  const hasUploads = (imports?.length || 0) > 0;
  const hasAllCategorized = pendingCount === 0 && hasUploads;

  const nextStep = determineNextStep({
    hasMonth: !!currentMonth,
    monthClosed: !!currentMonth?.closed_at,
    pendingCount,
    hasUploads,
    daysSinceLastUpload: getDaysSinceLastUpload(),
    isFirstDayOfMonth,
  });

  const isFirstMonth = !hasBudget || !hasUploads || !hasAllCategorized;

  // Empty state
  if (!currentMonth) {
    return (
      <AppLayout>
        <AnimatePresence>
          {showOnboarding && (
            <OnboardingWizard 
              onComplete={completeOnboarding} 
              onSkip={skipOnboarding} 
            />
          )}
        </AnimatePresence>
        <div className="max-w-lg mx-auto text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="w-20 h-20 rounded-3xl bg-foreground flex items-center justify-center mx-auto mb-8">
              <span className="text-background font-bold text-4xl">R</span>
            </div>
            <h1 className="text-display text-foreground mb-4">
              Primeiro mês
            </h1>
            <p className="text-body text-muted-foreground mb-10 max-w-sm mx-auto">
              Configure seu orçamento mensal em menos de 10 minutos. 
              É o primeiro passo para clareza financeira.
            </p>
            <Link to="/budget">
              <Button variant="hero" size="lg" className="gap-2">
                <span>Começar</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-10">
        {/* Test Banner */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full rounded-3xl bg-gradient-to-r from-destructive via-destructive/80 to-destructive/60 p-8 sm:p-12 text-destructive-foreground"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium uppercase tracking-wider opacity-80 mb-2">
                🚧 Modo de Testes
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                Banner Gigante de Testes
              </h2>
              <p className="text-lg opacity-90 max-w-xl">
                Este é um banner temporário para fins de teste. 
                Pode ser removido a qualquer momento.
              </p>
            </div>
            <Button 
              variant="secondary" 
              size="lg" 
              className="shrink-0 bg-background text-foreground hover:bg-background/90"
            >
              Ação de Teste
            </Button>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-display text-foreground capitalize">
                {getMonthName()}
              </h1>
              {currentMonth.closed_at && <RitualBadge />}
            </div>
            <p className="text-body text-muted-foreground">
              {getDaysRemaining()} dias restantes
            </p>
          </div>
          <Link to="/budget">
            <Button variant="default" className="gap-2">
              Ritual Dia 1
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Hero Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center py-8"
        >
          <p className="text-caption text-muted-foreground mb-2">
            {isPositive ? "Economia do mês" : "Acima do orçamento"}
          </p>
          <p className={`hero-number ${isPositive ? "text-success" : "text-destructive"}`}>
            {isPositive ? "+" : "-"}R$ {Math.abs(savingsAmount).toLocaleString('pt-BR')}
          </p>
        </motion.div>

        {/* Next Step Card */}
        <NextStepCard
          stepType={nextStep}
          pendingCount={pendingCount}
          daysSinceLastUpload={getDaysSinceLastUpload()}
          weekProgress={getWeekOfMonth()}
          isFirstMonth={isFirstMonth}
        />

        {/* Setup Checklist */}
        {isFirstMonth && (
          <SetupChecklist
            hasMonth={!!currentMonth}
            hasBudget={hasBudget}
            hasUploads={hasUploads}
            hasAllCategorized={hasAllCategorized}
          />
        )}

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-3 gap-4">
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/report">
              <Card variant="filled" className="hover:bg-muted/80 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <p className="text-caption text-muted-foreground mb-1">Relatório</p>
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <span className="text-body font-medium">Ver detalhes</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>

        {/* Action Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Link to="/uploads">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Upload className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-title text-foreground mb-1">Upload Semanal</p>
                    <p className="text-caption text-muted-foreground">
                      Envie prints e OFX
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/transactions">
              <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer h-full ${pendingCount > 0 ? "ring-2 ring-warning/50" : ""}`}>
                <CardContent className="p-6 flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    pendingCount > 0 ? "bg-warning/10" : "bg-success/10"
                  }`}>
                    {pendingCount > 0 ? (
                      <AlertCircle className="w-7 h-7 text-warning" />
                    ) : (
                      <CheckCircle2 className="w-7 h-7 text-success" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-title text-foreground mb-1">Transações</p>
                    {pendingCount > 0 ? (
                      <p className="text-caption text-warning font-medium">
                        {pendingCount} pendentes
                      </p>
                    ) : (
                      <p className="text-caption text-success">
                        Tudo categorizado
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
