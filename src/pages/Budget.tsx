import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Copy, 
  Check, 
  Pencil, 
  Calendar,
  CreditCard,
  Plus,
  Trash2,
  Lock,
  Loader2
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories } from "@/components/transactions/CategoryPopup";
import { toast } from "sonner";
import { useMonths, useCurrentMonth, useCategoryBudgets, useCreateMonth, useCloneMonth, useCloseMonth, useUpdateCategoryBudget } from "@/hooks/useMonths";
import { useRecurringBills, useCreateRecurringBill, useUpdateRecurringBill, useDeleteRecurringBill } from "@/hooks/useRecurringBills";
import { useCards, useCreateCard, useUpdateCard, useDeleteCard } from "@/hooks/useCards";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const Budget = () => {
  const { data: months, isLoading: isLoadingMonths } = useMonths();
  const { data: currentMonth, isLoading: isLoadingCurrentMonth } = useCurrentMonth();
  const { data: categoryBudgets, isLoading: isLoadingBudgets } = useCategoryBudgets(currentMonth?.id);
  const { data: recurringBills, isLoading: isLoadingBills } = useRecurringBills();
  const { data: cards, isLoading: isLoadingCards } = useCards();

  const createMonth = useCreateMonth();
  const cloneMonth = useCloneMonth();
  const closeMonth = useCloseMonth();
  const updateCategoryBudget = useUpdateCategoryBudget();
  const createRecurringBill = useCreateRecurringBill();
  const updateRecurringBill = useUpdateRecurringBill();
  const deleteRecurringBill = useDeleteRecurringBill();
  const createCard = useCreateCard();
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();

  const [step, setStep] = useState(1);
  const [localBudgets, setLocalBudgets] = useState<Record<string, number>>({});

  const isLoading = isLoadingMonths || isLoadingCurrentMonth || isLoadingBudgets || isLoadingBills || isLoadingCards;
  const isLocked = !!currentMonth?.closed_at;

  // Initialize local budgets from DB
  useEffect(() => {
    if (categoryBudgets) {
      const budgets: Record<string, number> = {};
      categoryBudgets.forEach(b => {
        budgets[b.id] = Number(b.planned_amount);
      });
      setLocalBudgets(budgets);
    }
  }, [categoryBudgets]);

  // Determine step based on current month state
  useEffect(() => {
    if (currentMonth) {
      setStep(currentMonth.closed_at ? 3 : 2);
    } else {
      setStep(1);
    }
  }, [currentMonth]);

  const totalPlanned = categoryBudgets?.reduce((sum, cat) => sum + Number(cat.planned_amount), 0) || 0;

  // Find previous month for cloning
  const previousMonth = months?.find(m => {
    const prevDate = subMonths(new Date(), 1);
    return m.year_month === format(prevDate, "yyyy-MM");
  });

  const handleClone = async () => {
    try {
      if (previousMonth) {
        await cloneMonth.mutateAsync({
          sourceMonthId: previousMonth.id,
          targetYearMonth: format(new Date(), "yyyy-MM"),
        });
        toast.success("Orçamento do mês anterior clonado!");
      } else {
        await createMonth.mutateAsync(format(new Date(), "yyyy-MM"));
        toast.success("Novo mês criado!");
      }
      setStep(2);
    } catch (error) {
      toast.error("Erro ao criar mês");
    }
  };

  const handleLock = async () => {
    if (!currentMonth) return;
    try {
      await closeMonth.mutateAsync(currentMonth.id);
      toast.success("Mês fechado com sucesso! 🎉", {
        description: "O orçamento está agora travado.",
      });
    } catch (error) {
      toast.error("Erro ao fechar mês");
    }
  };

  const handleBudgetChange = async (budgetId: string, amount: number) => {
    setLocalBudgets(prev => ({ ...prev, [budgetId]: amount }));
  };

  const handleBudgetBlur = async (budgetId: string) => {
    const amount = localBudgets[budgetId];
    if (amount !== undefined) {
      try {
        await updateCategoryBudget.mutateAsync({ id: budgetId, planned_amount: amount });
      } catch (error) {
        toast.error("Erro ao salvar orçamento");
      }
    }
  };

  const getCategoryInfo = (id: string) => {
    return categories.find(c => c.id === id);
  };

  const previousMonthName = previousMonth 
    ? format(new Date(previousMonth.year_month + "-01"), "MMMM yyyy", { locale: ptBR })
    : null;

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
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Orçamento do Mês
            </h1>
            {currentMonth && (
              isLocked ? (
                <Button variant="outline" size="sm" className="gap-2" disabled>
                  <Lock className="w-4 h-4" />
                  Mês Fechado
                </Button>
              ) : (
                <Button variant="hero" size="sm" onClick={handleLock} className="gap-2">
                  <Check className="w-4 h-4" />
                  Fechar Mês
                </Button>
              )
            )}
          </div>
          <p className="text-muted-foreground">
            Ritual Dia 1 — Configure o orçamento em até 10 minutos
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-1 rounded-full ${step > s ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {step === 1 && "Iniciar mês"}
              {step === 2 && "Ajustar valores"}
              {step === 3 && "Mês fechado"}
            </span>
          </div>
        </motion.div>

        {/* Clone Step */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass" className="text-center py-12">
              <CardContent>
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Copy className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {previousMonth ? "Comece clonando o mês anterior" : "Comece criando o orçamento"}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {previousMonth 
                    ? "Isso traz todas as configurações do mês anterior. Depois você ajusta o que precisar."
                    : "Crie as categorias de orçamento para este mês."}
                </p>
                <Button 
                  variant="hero" 
                  size="lg" 
                  onClick={handleClone} 
                  className="gap-2"
                  disabled={createMonth.isPending || cloneMonth.isPending}
                >
                  {(createMonth.isPending || cloneMonth.isPending) ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                  {previousMonthName ? `Clonar ${previousMonthName}` : "Criar Orçamento"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Edit Steps */}
        {step >= 2 && (
          <div className="space-y-6">
            {/* Recurring Bills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Contas Recorrentes
                  </CardTitle>
                  <CardDescription>
                    Contas fixas com data de vencimento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recurringBills?.map((bill, index) => (
                    <motion.div
                      key={bill.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Input
                        value={bill.name}
                        className="flex-1 bg-transparent border-0 font-medium"
                        disabled={isLocked}
                        onChange={(e) => updateRecurringBill.mutate({ id: bill.id, name: e.target.value })}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">R$</span>
                        <Input
                          type="number"
                          value={bill.amount}
                          className="w-24 bg-card border-border"
                          disabled={isLocked}
                          onChange={(e) => updateRecurringBill.mutate({ id: bill.id, amount: Number(e.target.value) })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Dia</span>
                        <Input
                          type="number"
                          value={bill.due_day}
                          className="w-16 bg-card border-border"
                          disabled={isLocked}
                          onChange={(e) => updateRecurringBill.mutate({ id: bill.id, due_day: Number(e.target.value) })}
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={isLocked}
                        onClick={() => deleteRecurringBill.mutate(bill.id)}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </motion.div>
                  ))}
                  {(!recurringBills || recurringBills.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhuma conta recorrente cadastrada
                    </p>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full gap-2" 
                    disabled={isLocked}
                    onClick={() => createRecurringBill.mutate({ name: "Nova conta", amount: 0, due_day: 1 })}
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar conta
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Budgets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Pencil className="w-5 h-5 text-primary" />
                      Orçamento por Categoria
                    </span>
                    <span className="text-base font-normal text-muted-foreground">
                      Total: <span className="font-semibold text-foreground">R$ {totalPlanned.toLocaleString('pt-BR')}</span>
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {categoryBudgets?.map((cat, index) => {
                      const info = getCategoryInfo(cat.category);
                      if (!info) return null;
                      
                      return (
                        <motion.div
                          key={cat.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.04 }}
                        >
                          <div className={`w-10 h-10 rounded-xl ${info.color} flex items-center justify-center shrink-0`}>
                            <info.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="flex-1 font-medium text-foreground">{info.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">R$</span>
                            <Input
                              type="number"
                              value={localBudgets[cat.id] ?? Number(cat.planned_amount)}
                              className="w-24 bg-card border-border"
                              disabled={isLocked}
                              onChange={(e) => handleBudgetChange(cat.id, Number(e.target.value))}
                              onBlur={() => handleBudgetBlur(cat.id)}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Credit Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Cartões de Crédito
                  </CardTitle>
                  <CardDescription>
                    Defina o teto de gastos mensal para cada cartão
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cards?.map((card, index) => (
                    <motion.div
                      key={card.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <Input
                        value={card.name}
                        className="flex-1 bg-transparent border-0 font-medium"
                        disabled={isLocked}
                        onChange={(e) => updateCard.mutate({ id: card.id, name: e.target.value })}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Teto: R$</span>
                        <Input
                          type="number"
                          value={card.monthly_limit}
                          className="w-24 bg-card border-border"
                          disabled={isLocked}
                          onChange={(e) => updateCard.mutate({ id: card.id, monthly_limit: Number(e.target.value) })}
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={isLocked}
                        onClick={() => deleteCard.mutate(card.id)}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </motion.div>
                  ))}
                  {(!cards || cards.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum cartão cadastrado
                    </p>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full gap-2" 
                    disabled={isLocked}
                    onClick={() => createCard.mutate({ name: "Novo cartão", monthly_limit: 0 })}
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar cartão
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions */}
            {step === 2 && !isLocked && (
              <motion.div
                className="flex justify-end gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button variant="hero" onClick={handleLock} className="gap-2">
                  <Check className="w-4 h-4" />
                  Fechar Mês
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Budget;
