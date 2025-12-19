import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { 
  Copy, 
  Check, 
  Calendar,
  CreditCard,
  Plus,
  Loader2,
  ArrowRight
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";
import { getCategoryDisplayName } from "@/utils/categoryDisplay";
import { 
  useCurrentMonth, 
  useMonths, 
  useCreateMonth, 
  useCloneMonth, 
  useCloseMonth,
  useCategoryBudgets,
  useUpdateCategoryBudget
} from "@/hooks/useMonths";
import { 
  useRecurringBills, 
  useCreateRecurringBill, 
  useUpdateRecurringBill, 
  useDeleteRecurringBill,
} from "@/hooks/useRecurringBills";
import { 
  useCards, 
  useCreateCard, 
  useUpdateCard, 
  useDeleteCard 
} from "@/hooks/useCards";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EditableBillRow } from "@/components/budget/EditableBillRow";
import { CategoryBudgetInput } from "@/components/budget/CategoryBudgetInput";
import { EditableCardRow } from "@/components/budget/EditableCardRow";
import confetti from "canvas-confetti";

const Budget = () => {
  const [step, setStep] = useState(1);
  const [isEditingLocked, setIsEditingLocked] = useState(false);
  const [newBillName, setNewBillName] = useState("");
  const [newBillAmount, setNewBillAmount] = useState("");
  const [newBillDueDay, setNewBillDueDay] = useState("");
  const [newCardName, setNewCardName] = useState("");
  const [newCardLimit, setNewCardLimit] = useState("");

  const { data: currentMonth, isLoading: monthLoading } = useCurrentMonth();
  const { data: allMonths } = useMonths();
  const { data: categoryBudgets, isLoading: budgetsLoading } = useCategoryBudgets(currentMonth?.id);
  const { data: categories } = useCategories();
  const { data: recurringBills, isLoading: billsLoading } = useRecurringBills();
  const { data: cards, isLoading: cardsLoading } = useCards();

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

  const isLoading = monthLoading || budgetsLoading || billsLoading || cardsLoading;
  const isLocked = !!currentMonth?.closed_at;

  const previousMonth = allMonths?.find(m => {
    if (!currentMonth) {
      const now = new Date();
      const prevMonth = subMonths(now, 1);
      return m.year_month === format(prevMonth, "yyyy-MM");
    }
    return false;
  });

  useEffect(() => {
    if (currentMonth && categoryBudgets && categoryBudgets.length > 0) {
      setStep(2);
    }
  }, [currentMonth, categoryBudgets]);

  useEffect(() => {
    setIsEditingLocked(false);
  }, [currentMonth?.id]);

  const totalPlanned = categoryBudgets?.reduce((sum, cat) => sum + (cat.planned_amount || 0), 0) || 0;
  const currentYearMonth = new Date().toISOString().slice(0, 7);

  const handleCreateMonth = async () => {
    try {
      await createMonth.mutateAsync(currentYearMonth);
      setStep(2);
    } catch (error) {
      console.error("Erro ao criar mês:", error);
      toast.error("Não foi possível criar o mês", {
        description: "Tente novamente em instantes.",
      });
    }
  };

  const handleClone = async () => {
    if (!previousMonth) {
      await handleCreateMonth();
      return;
    }
    try {
      await cloneMonth.mutateAsync({ 
        sourceMonthId: previousMonth.id, 
        targetYearMonth: currentYearMonth 
      });
      setStep(2);
    } catch (error) {
      console.error("Erro ao clonar mês:", error);
      toast.error("Não foi possível clonar o mês", {
        description: "Tente novamente em instantes.",
      });
    }
  };

  const triggerConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#007AFF', '#34C759', '#FFD60A'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#007AFF', '#34C759', '#FFD60A'],
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const handleLock = async () => {
    if (!currentMonth) return;
    try {
      await closeMonth.mutateAsync(currentMonth.id);
      triggerConfetti();
      toast.success("Mês fechado!", {
        description: "O orçamento está agora travado.",
      });
    } catch (error) {
      console.error("Erro ao fechar mês:", error);
      toast.error("Não foi possível fechar o mês", {
        description: "Verifique sua conexão e tente novamente.",
      });
    }
  };

  const handleUnlock = () => {
    setIsEditingLocked(true);
    toast.info("Modo de edição ativado");
  };

  const handleLockEditing = () => {
    setIsEditingLocked(false);
    toast.success("Edições salvas");
  };

  const handleUpdateCategoryBudget = (budgetId: string, amount: number) => {
    updateCategoryBudget.mutate({ id: budgetId, planned_amount: amount });
  };

  const handleStepClick = (targetStep: number) => {
    if (currentMonth && (targetStep <= step || targetStep === step + 1)) {
      setStep(targetStep);
    }
  };

  const handleAddBill = () => {
    if (!newBillName || !newBillAmount || !newBillDueDay) return;
    createRecurringBill.mutate({
      name: newBillName,
      amount: parseFloat(newBillAmount),
      due_day: parseInt(newBillDueDay),
    });
    setNewBillName("");
    setNewBillAmount("");
    setNewBillDueDay("");
  };

  const handleAddCard = () => {
    if (!newCardName || !newCardLimit) return;
    createCard.mutate({
      name: newCardName,
      monthly_limit: parseFloat(newCardLimit),
    });
    setNewCardName("");
    setNewCardLimit("");
  };

  const getPreviousMonthName = () => {
    const now = new Date();
    const prevMonth = subMonths(now, 1);
    return format(prevMonth, "MMMM yyyy", { locale: ptBR });
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

  return (
    <AppLayout>
      <div className="space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-display text-foreground mb-2">
              Orçamento
            </h1>
            <p className="text-body text-muted-foreground">
              Configure em menos de 10 minutos
            </p>
          </div>
          {currentMonth && (
            isLocked ? (
              isEditingLocked ? (
                <Button variant="default" onClick={handleLockEditing} className="gap-2">
                  <Check className="w-4 h-4" />
                  Salvar
                </Button>
              ) : (
                <Button variant="outline" onClick={handleUnlock}>
                  Editar
                </Button>
              )
            ) : (
              <Button 
                variant="hero" 
                onClick={handleLock} 
                className="gap-2"
                disabled={closeMonth.isPending}
              >
                {closeMonth.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Fechar Mês
              </Button>
            )
          )}
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          {[1, 2, 3].map((s) => {
            const isClickable = currentMonth && (s <= step || s === step + 1);
            return (
              <div key={s} className="flex items-center gap-3">
                <button
                  onClick={() => handleStepClick(s)}
                  disabled={!isClickable}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-semibold transition-all ${
                    step >= s
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground"
                  } ${isClickable ? "cursor-pointer hover:ring-2 hover:ring-foreground/20" : "cursor-default"}`}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </button>
                {s < 3 && (
                  <div className={`w-16 h-0.5 rounded-full ${step > s ? "bg-foreground" : "bg-muted"}`} />
                )}
              </div>
            );
          })}
          <span className="ml-4 text-caption text-muted-foreground">
            {step === 1 && "Clonar mês"}
            {step === 2 && "Ajustar valores"}
            {step === 3 && "Revisar"}
          </span>
        </motion.div>

        {/* Clone Step */}
        {step === 1 && !currentMonth && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="filled" className="text-center py-16">
              <CardContent>
                <div className="w-20 h-20 rounded-3xl bg-foreground flex items-center justify-center mx-auto mb-8">
                  <Copy className="w-10 h-10 text-background" />
                </div>
                <h2 className="text-headline text-foreground mb-3">
                  {previousMonth ? "Clonar mês anterior" : "Criar orçamento"}
                </h2>
                <p className="text-body text-muted-foreground mb-8 max-w-sm mx-auto">
                  {previousMonth 
                    ? `Copie as configurações de ${getPreviousMonthName()} e ajuste o que precisar.`
                    : "Configure as categorias e valores do seu orçamento mensal."
                  }
                </p>
                <Button 
                  variant="hero" 
                  size="lg" 
                  onClick={handleClone} 
                  className="gap-2"
                  disabled={cloneMonth.isPending || createMonth.isPending}
                >
                  {(cloneMonth.isPending || createMonth.isPending) ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>{previousMonth ? "Clonar" : "Criar"}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Edit Steps */}
        {(step >= 2 || currentMonth) && (
          <div className="space-y-8">
            {/* Recurring Bills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    Contas Fixas
                  </CardTitle>
                  <CardDescription>
                    Boletos, financiamentos e mensalidades
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recurringBills?.map((bill, index) => (
                    <EditableBillRow
                      key={bill.id}
                      bill={bill}
                      index={index}
                      isLocked={isLocked}
                      isEditingLocked={isEditingLocked}
                      onUpdate={(id, updates) => updateRecurringBill.mutate({ id, ...updates })}
                      onDelete={(id) => deleteRecurringBill.mutate(id)}
                      isUpdating={updateRecurringBill.isPending}
                    />
                  ))}
                  
                  {(!isLocked || isEditingLocked) && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border-2 border-dashed border-muted">
                      <Input
                        placeholder="Nome da conta"
                        value={newBillName}
                        className="flex-1 bg-transparent border-0 focus-visible:ring-0"
                        onChange={(e) => setNewBillName(e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-caption text-muted-foreground">R$</span>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newBillAmount}
                          className="w-24 bg-card"
                          onChange={(e) => setNewBillAmount(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-caption text-muted-foreground">Dia</span>
                        <Input
                          type="number"
                          placeholder="1"
                          value={newBillDueDay}
                          className="w-16 bg-card"
                          onChange={(e) => setNewBillDueDay(e.target.value)}
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleAddBill}
                        disabled={!newBillName || !newBillAmount || !newBillDueDay || createRecurringBill.isPending}
                        className="rounded-full"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Budgets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Orçamento por Categoria</span>
                    <span className="text-body font-normal text-muted-foreground">
                      Total: <span className="font-semibold text-foreground">R$ {totalPlanned.toLocaleString('pt-BR')}</span>
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {categoryBudgets?.map((cat, index) => {
                      const label = getCategoryDisplayName(cat.category, categories);

                      return (
                        <CategoryBudgetInput
                          key={cat.id}
                          budgetId={cat.id}
                          categoryKeyOrLegacy={cat.category}
                          categoryLabel={label}
                          plannedAmount={cat.planned_amount}
                          isLocked={isLocked}
                          isEditingLocked={isEditingLocked}
                          index={index}
                          onUpdate={handleUpdateCategoryBudget}
                        />
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    Cartões de Crédito
                  </CardTitle>
                  <CardDescription>
                    Defina o teto mensal de cada cartão
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cards?.map((card, index) => (
                    <EditableCardRow
                      key={card.id}
                      card={card}
                      index={index}
                      isLocked={isLocked}
                      isEditingLocked={isEditingLocked}
                      onUpdate={(id, updates) => updateCard.mutate({ id, ...updates })}
                      onDelete={(id) => deleteCard.mutate(id)}
                      isUpdating={updateCard.isPending}
                    />
                  ))}
                  
                  {(!isLocked || isEditingLocked) && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border-2 border-dashed border-muted">
                      <Input
                        placeholder="Nome do cartão"
                        value={newCardName}
                        className="flex-1 bg-transparent border-0 focus-visible:ring-0"
                        onChange={(e) => setNewCardName(e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-caption text-muted-foreground">Limite R$</span>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newCardLimit}
                          className="w-28 bg-card"
                          onChange={(e) => setNewCardLimit(e.target.value)}
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleAddCard}
                        disabled={!newCardName || !newCardLimit || createCard.isPending}
                        className="rounded-full"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Budget;
