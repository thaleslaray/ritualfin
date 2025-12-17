import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { 
  Copy, 
  Check, 
  Pencil, 
  Calendar,
  CreditCard,
  Plus,
  Trash2,
  Lock,
  LockOpen,
  Loader2
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories } from "@/components/transactions/CategoryPopup";
import { toast } from "sonner";
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
  RecurringBill
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
  const [isEditingLocked, setIsEditingLocked] = useState(false); // Permite editar mesmo após fechar
  const [newBillName, setNewBillName] = useState("");
  const [newBillAmount, setNewBillAmount] = useState("");
  const [newBillDueDay, setNewBillDueDay] = useState("");
  const [newCardName, setNewCardName] = useState("");
  const [newCardLimit, setNewCardLimit] = useState("");

  // Data hooks
  const { data: currentMonth, isLoading: monthLoading } = useCurrentMonth();
  const { data: allMonths } = useMonths();
  const { data: categoryBudgets, isLoading: budgetsLoading } = useCategoryBudgets(currentMonth?.id);
  const { data: recurringBills, isLoading: billsLoading } = useRecurringBills();
  const { data: cards, isLoading: cardsLoading } = useCards();

  // Mutations
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

  // Get previous month for cloning
  const previousMonth = allMonths?.find(m => {
    if (!currentMonth) {
      const now = new Date();
      const prevMonth = subMonths(now, 1);
      return m.year_month === format(prevMonth, "yyyy-MM");
    }
    return false;
  });

  // Auto advance to step 2 if month exists with budgets
  useEffect(() => {
    if (currentMonth && categoryBudgets && categoryBudgets.length > 0) {
      setStep(2);
    }
  }, [currentMonth, categoryBudgets]);

  // Reset editing state when month changes
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
      // Error handled by mutation
    }
  };

  const handleClone = async () => {
    if (!previousMonth) {
      // No previous month to clone, just create new
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
      // Error handled by mutation
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
        colors: ['#0F4C81', '#17A589', '#F5C156'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#0F4C81', '#17A589', '#F5C156'],
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
      toast.success("Mês fechado com sucesso! 🎉", {
        description: "O orçamento está agora travado. Alterações serão marcadas.",
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleUnlock = () => {
    setIsEditingLocked(true);
    toast.info("Modo de edição ativado", {
      description: "Edições após fechamento serão marcadas no relatório.",
    });
  };

  const handleLockEditing = () => {
    setIsEditingLocked(false);
    toast.success("Edições salvas");
  };

  const handleUpdateCategoryBudget = (budgetId: string, amount: number) => {
    updateCategoryBudget.mutate({ id: budgetId, planned_amount: amount });
  };

  const handleStepClick = (targetStep: number) => {
    // Só permite navegar para steps já completados ou o próximo
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

  const getCategoryInfo = (id: string) => {
    return categories.find(c => c.id === id);
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
                isEditingLocked ? (
                  <Button variant="outline" size="sm" onClick={handleLockEditing} className="gap-2">
                    <Check className="w-4 h-4" />
                    Salvar Edições
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleUnlock} className="gap-2">
                    <LockOpen className="w-4 h-4" />
                    Editar Mês Fechado
                  </Button>
                )
              ) : (
                <Button 
                  variant="hero" 
                  size="sm" 
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
            {[1, 2, 3].map((s) => {
              const isClickable = currentMonth && (s <= step || s === step + 1);
              return (
                <div key={s} className="flex items-center gap-2">
                  <button
                    onClick={() => handleStepClick(s)}
                    disabled={!isClickable}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      step >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    } ${isClickable ? "cursor-pointer hover:ring-2 hover:ring-primary/50" : "cursor-default"}`}
                  >
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </button>
                  {s < 3 && (
                    <div className={`w-12 h-1 rounded-full ${step > s ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              );
            })}
            <span className="ml-2 text-sm text-muted-foreground">
              {step === 1 && "Clonar mês anterior"}
              {step === 2 && "Ajustar valores"}
              {step === 3 && "Revisar e fechar"}
            </span>
          </div>
        </motion.div>

        {/* Clone Step */}
        {step === 1 && !currentMonth && (
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
                  {previousMonth ? "Comece clonando o mês anterior" : "Crie seu primeiro orçamento"}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {previousMonth 
                    ? `Isso traz todas as configurações de ${getPreviousMonthName()}. Depois você ajusta o que precisar.`
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
                    <Copy className="w-5 h-5" />
                  )}
                  {previousMonth ? `Clonar ${getPreviousMonthName()}` : "Criar Orçamento"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Edit Steps */}
        {(step >= 2 || currentMonth) && (
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
                    Contas Fixas
                  </CardTitle>
                  <CardDescription>
                    Boletos, financiamentos, mensalidades e outras contas com vencimento mensal
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
                  
                  {/* Add new bill form */}
                  {(!isLocked || isEditingLocked) && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border-2 border-dashed border-muted">
                      <Input
                        placeholder="Ex: Financiamento, Colégio, Aluguel"
                        value={newBillName}
                        className="flex-1 bg-transparent"
                        onChange={(e) => setNewBillName(e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">R$</span>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newBillAmount}
                          className="w-24 bg-card border-border"
                          onChange={(e) => setNewBillAmount(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Dia</span>
                        <Input
                          type="number"
                          placeholder="1"
                          value={newBillDueDay}
                          className="w-16 bg-card border-border"
                          onChange={(e) => setNewBillDueDay(e.target.value)}
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleAddBill}
                        disabled={!newBillName || !newBillAmount || !newBillDueDay || createRecurringBill.isPending}
                      >
                        <Plus className="w-4 h-4" />
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
                        <CategoryBudgetInput
                          key={cat.id}
                          budgetId={cat.id}
                          category={cat.category}
                          plannedAmount={cat.planned_amount}
                          isLocked={isLocked}
                          isEditingLocked={isEditingLocked}
                          index={index}
                          categoryInfo={info}
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
                  
                  {/* Add new card form */}
                  {(!isLocked || isEditingLocked) && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border-2 border-dashed border-muted">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <Input
                        placeholder="Nome do cartão"
                        value={newCardName}
                        className="flex-1 bg-transparent"
                        onChange={(e) => setNewCardName(e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Teto: R$</span>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newCardLimit}
                          className="w-24 bg-card border-border"
                          onChange={(e) => setNewCardLimit(e.target.value)}
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleAddCard}
                        disabled={!newCardName || !newCardLimit || createCard.isPending}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
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
                <Button variant="outline" onClick={() => setStep(3)}>
                  Revisar
                </Button>
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
              </motion.div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Budget;
