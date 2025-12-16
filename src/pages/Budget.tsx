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
  useDeleteRecurringBill 
} from "@/hooks/useRecurringBills";
import { 
  useCards, 
  useCreateCard, 
  useUpdateCard, 
  useDeleteCard 
} from "@/hooks/useCards";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const Budget = () => {
  const [step, setStep] = useState(1);
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

  const handleLock = async () => {
    if (!currentMonth) return;
    try {
      await closeMonth.mutateAsync(currentMonth.id);
      toast.success("Mês fechado com sucesso! 🎉", {
        description: "O orçamento está agora travado. Alterações serão marcadas.",
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleUnlock = () => {
    toast.info("Edições após fechamento serão marcadas", {
      description: "As alterações ficam visíveis no relatório.",
    });
  };

  const handleUpdateCategoryBudget = (budgetId: string, amount: number) => {
    updateCategoryBudget.mutate({ id: budgetId, planned_amount: amount });
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
                <Button variant="outline" size="sm" onClick={handleUnlock} className="gap-2">
                  <Lock className="w-4 h-4" />
                  Mês Fechado
                </Button>
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
                          onChange={(e) => updateRecurringBill.mutate({ id: bill.id, amount: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Dia</span>
                        <Input
                          type="number"
                          value={bill.due_day}
                          className="w-16 bg-card border-border"
                          disabled={isLocked}
                          onChange={(e) => updateRecurringBill.mutate({ id: bill.id, due_day: parseInt(e.target.value) || 1 })}
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
                  
                  {/* Add new bill form */}
                  {!isLocked && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border-2 border-dashed border-muted">
                      <Input
                        placeholder="Nome da conta"
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
                              value={cat.planned_amount}
                              className="w-24 bg-card border-border"
                              disabled={isLocked}
                              onChange={(e) => handleUpdateCategoryBudget(cat.id, parseFloat(e.target.value) || 0)}
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
                          onChange={(e) => updateCard.mutate({ id: card.id, monthly_limit: parseFloat(e.target.value) || 0 })}
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
                  
                  {/* Add new card form */}
                  {!isLocked && (
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
