import { 
  ChevronRight,
  Loader2,
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
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
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
        {showOnboarding && (
          <OnboardingWizard 
            onComplete={completeOnboarding} 
            onSkip={skipOnboarding} 
          />
        )}
        <div className="max-w-md mx-auto text-center py-16">
          <h1 className="text-headline text-foreground mb-2">
            Primeiro mês
          </h1>
          <p className="text-body text-muted-foreground mb-6">
            Configure seu orçamento mensal em menos de 10 minutos.
          </p>
          <Link to="/budget">
            <Button>Começar</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-headline text-foreground capitalize">
                {getMonthName()}
              </h1>
              {currentMonth.closed_at && <RitualBadge />}
            </div>
            <p className="text-body text-muted-foreground">
              {getDaysRemaining()} dias restantes
            </p>
          </div>
          <Link to="/budget">
            <Button variant="outline">
              Ritual Dia 1
            </Button>
          </Link>
        </div>

        {/* Hero Number */}
        <div className="text-center py-6">
          <p className="text-caption text-muted-foreground mb-1">
            {isPositive ? "Economia" : "Acima do orçamento"}
          </p>
          <p className={`text-headline ${isPositive ? "" : ""}`}>
            {isPositive ? "+" : "-"}R$ {Math.abs(savingsAmount).toLocaleString('pt-BR')}
          </p>
        </div>

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

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-caption text-muted-foreground mb-1">Planejado</p>
              <p className="text-body font-medium text-foreground">
                R$ {totalPlanned.toLocaleString('pt-BR')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-caption text-muted-foreground mb-1">Real</p>
              <p className="text-body font-medium text-foreground">
                R$ {totalActual.toLocaleString('pt-BR')}
              </p>
            </CardContent>
          </Card>

          <Link to="/report">
            <Card className="hover:bg-muted/50 cursor-pointer h-full">
              <CardContent className="p-4 text-center">
                <p className="text-caption text-muted-foreground mb-1">Relatório</p>
                <div className="flex items-center justify-center gap-1 text-foreground">
                  <span className="text-body font-medium">Ver</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Action Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/uploads">
            <Card className="hover:bg-muted/50 cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-body font-medium text-foreground">Upload</p>
                  <p className="text-caption text-muted-foreground">Prints e OFX</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/transactions">
            <Card className={`hover:bg-muted/50 cursor-pointer ${pendingCount > 0 ? "border-foreground" : ""}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                  {pendingCount > 0 ? (
                    <AlertCircle className="w-5 h-5 text-foreground" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-body font-medium text-foreground">Transações</p>
                  <p className="text-caption text-muted-foreground">
                    {pendingCount > 0 ? `${pendingCount} pendentes` : "Tudo ok"}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
