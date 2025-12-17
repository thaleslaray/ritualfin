import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Calendar, 
  Upload, 
  CheckCircle2,
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
    description: "Clareza sobre o dinheiro do casal em 10 minutos por semana.",
  },
  {
    icon: Calendar,
    title: "Dia 1 do Mês",
    description: "Cadastrem contas fixas e definam quanto gastar em cada categoria.",
  },
  {
    icon: Upload,
    title: "Quartas-feiras",
    description: "Enviem prints do cartão ou arquivos OFX. O sistema extrai tudo.",
  },
  {
    icon: CheckCircle2,
    title: "Sem Surpresas",
    description: "Acompanhem o real vs planejado e fechem o mês com clareza.",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/20" onClick={onSkip} />

      {/* Card */}
      <div className="relative w-full max-w-sm bg-card rounded-md border border-border p-6">
        {/* Skip */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full ${
                index <= currentStep ? "bg-foreground" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center mx-auto mb-4">
            <Icon className="w-6 h-6 text-foreground" />
          </div>
          <h2 className="text-headline text-foreground mb-2">
            {step.title}
          </h2>
          <p className="text-body text-muted-foreground mb-6">
            {step.description}
          </p>
          <Button className="w-full" onClick={handleNext}>
            {isLastStep ? "Começar" : "Próximo"}
          </Button>
        </div>
      </div>
    </div>
  );
};

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
