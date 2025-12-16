import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Copy, 
  Check, 
  Pencil, 
  Calendar,
  CreditCard,
  Plus,
  Trash2,
  Lock,
  Unlock
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories } from "@/components/transactions/CategoryPopup";
import { toast } from "sonner";

// Sample budget data
const initialBudget = {
  recurringBills: [
    { id: "1", name: "Aluguel", amount: 2000, dueDay: 5 },
    { id: "2", name: "Internet", amount: 150, dueDay: 10 },
    { id: "3", name: "Energia", amount: 250, dueDay: 15 },
    { id: "4", name: "Água", amount: 100, dueDay: 20 },
  ],
  categoryBudgets: [
    { id: "moradia", amount: 2500 },
    { id: "alimentacao", amount: 1800 },
    { id: "transporte", amount: 800 },
    { id: "saude", amount: 400 },
    { id: "compras", amount: 1200 },
    { id: "lazer", amount: 600 },
    { id: "tecnologia", amount: 500 },
    { id: "outros", amount: 700 },
  ],
  cards: [
    { id: "1", name: "Nubank", limit: 3000 },
    { id: "2", name: "Inter", limit: 2000 },
  ],
};

const Budget = () => {
  const [step, setStep] = useState(1);
  const [isLocked, setIsLocked] = useState(false);
  const [budget, setBudget] = useState(initialBudget);

  const totalPlanned = budget.categoryBudgets.reduce((sum, cat) => sum + cat.amount, 0);

  const handleClone = () => {
    toast.success("Orçamento do mês anterior clonado!");
    setStep(2);
  };

  const handleLock = () => {
    setIsLocked(true);
    toast.success("Mês fechado com sucesso! 🎉", {
      description: "O orçamento está agora travado. Alterações serão marcadas.",
    });
  };

  const handleUnlock = () => {
    setIsLocked(false);
    toast.info("Modo de edição ativado", {
      description: "Alterações serão marcadas como 'após fechamento'.",
    });
  };

  const getCategoryInfo = (id: string) => {
    return categories.find(c => c.id === id);
  };

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
            {isLocked ? (
              <Button variant="outline" size="sm" onClick={handleUnlock} className="gap-2">
                <Lock className="w-4 h-4" />
                Mês Fechado
              </Button>
            ) : (
              <Button variant="hero" size="sm" onClick={handleLock} className="gap-2">
                <Check className="w-4 h-4" />
                Fechar Mês
              </Button>
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
                  Comece clonando o mês anterior
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Isso traz todas as configurações de novembro para dezembro. 
                  Depois você ajusta o que precisar.
                </p>
                <Button variant="hero" size="lg" onClick={handleClone} className="gap-2">
                  <Copy className="w-5 h-5" />
                  Clonar Novembro 2024
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
                  {budget.recurringBills.map((bill, index) => (
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
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">R$</span>
                        <Input
                          type="number"
                          value={bill.amount}
                          className="w-24 bg-card border-border"
                          disabled={isLocked}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Dia</span>
                        <Input
                          type="number"
                          value={bill.dueDay}
                          className="w-16 bg-card border-border"
                          disabled={isLocked}
                        />
                      </div>
                      <Button variant="ghost" size="icon" disabled={isLocked}>
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </motion.div>
                  ))}
                  <Button variant="outline" className="w-full gap-2" disabled={isLocked}>
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
                    {budget.categoryBudgets.map((cat, index) => {
                      const info = getCategoryInfo(cat.id);
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
                              value={cat.amount}
                              className="w-24 bg-card border-border"
                              disabled={isLocked}
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
                  {budget.cards.map((card, index) => (
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
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Teto: R$</span>
                        <Input
                          type="number"
                          value={card.limit}
                          className="w-24 bg-card border-border"
                          disabled={isLocked}
                        />
                      </div>
                      <Button variant="ghost" size="icon" disabled={isLocked}>
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </motion.div>
                  ))}
                  <Button variant="outline" className="w-full gap-2" disabled={isLocked}>
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
                <Button variant="outline" onClick={() => setStep(3)}>
                  Revisar
                </Button>
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
