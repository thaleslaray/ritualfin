import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Calendar, 
  Upload, 
  CheckCircle2,
  ArrowRight,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    icon: Sparkles,
    title: "Bem-vindos ao Ritual Financeiro",
    description: "Vocês vão ter clareza sobre o dinheiro do casal em apenas 10 minutos por semana. Sem planilhas, sem drama.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Calendar,
    title: "Dia 1 do Mês",
    description: "Cadastrem as contas fixas (boletos, financiamentos) e definam quanto gastar em cada categoria. Leva uns 10 minutos.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Upload,
    title: "Quartas-feiras",
    description: "Uma vez por semana, enviem os prints do cartão ou arquivos OFX. O sistema extrai tudo automaticamente.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: CheckCircle2,
    title: "Sem Surpresas",
    description: "Acompanhem o real vs planejado e fechem o mês sabendo exatamente para onde foi o dinheiro.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
];

export const OnboardingWizard = ({ onComplete, onSkip }: OnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Card */}
      <motion.div
        className="relative w-full max-w-md bg-card rounded-3xl shadow-2xl border border-border overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25 }}
      >
        {/* Skip button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-6">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? "w-8 bg-primary" 
                  : index < currentStep 
                    ? "w-1.5 bg-primary/50"
                    : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="p-8 text-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={`w-20 h-20 rounded-2xl ${step.bgColor} flex items-center justify-center mx-auto mb-6`}
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <Icon className={`w-10 h-10 ${step.color}`} />
            </motion.div>

            <h2 className="text-2xl font-bold text-foreground mb-3">
              {step.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="p-6 pt-0">
          <Button
            variant="hero"
            size="lg"
            className="w-full gap-2"
            onClick={handleNext}
          >
            {isLastStep ? (
              <>
                <Sparkles className="w-5 h-5" />
                Começar Agora
              </>
            ) : (
              <>
                Próximo
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Hook to manage onboarding state
export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("onboarding_completed");
    if (!completed) {
      setShowOnboarding(true);
    }
    setHasChecked(true);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem("onboarding_completed", "true");
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem("onboarding_completed", "true");
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    hasChecked,
    completeOnboarding,
    skipOnboarding,
  };
};