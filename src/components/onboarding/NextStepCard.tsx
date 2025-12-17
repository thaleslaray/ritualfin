import { motion } from "framer-motion";
import { 
  Sparkles, 
  ListChecks, 
  Upload, 
  CheckCircle2, 
  Calendar,
  ChevronRight,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export type NextStepType = 
  | "day1_ritual"      // Day 1 - close budget
  | "categorize"       // Has pending transactions
  | "weekly_upload"    // Wednesday reminder
  | "upload_reminder"  // No uploads in a while
  | "all_done";        // Everything up to date

interface NextStepCardProps {
  stepType: NextStepType;
  pendingCount?: number;
  daysSinceLastUpload?: number;
  weekProgress?: number; // 0-4 (which week of the month)
  isFirstMonth?: boolean;
}

const stepConfig: Record<NextStepType, {
  icon: typeof Sparkles;
  title: string;
  description: string;
  buttonText: string;
  href: string;
  variant: "hero" | "default" | "secondary";
  colorClass: string;
}> = {
  day1_ritual: {
    icon: Sparkles,
    title: "Hora do Ritual Dia 1!",
    description: "Revise seu orçamento e feche o mês para começar com clareza.",
    buttonText: "Iniciar Ritual",
    href: "/budget",
    variant: "hero",
    colorClass: "bg-primary/10 text-primary",
  },
  categorize: {
    icon: ListChecks,
    title: "Transações pendentes",
    description: "Você tem transações aguardando categorização.",
    buttonText: "Categorizar",
    href: "/transactions",
    variant: "default",
    colorClass: "bg-warning/10 text-warning-foreground",
  },
  weekly_upload: {
    icon: Upload,
    title: "Ritual Semanal",
    description: "É quarta! Tire prints das suas faturas para manter tudo atualizado.",
    buttonText: "Enviar Prints",
    href: "/uploads",
    variant: "default",
    colorClass: "bg-secondary/10 text-secondary-foreground",
  },
  upload_reminder: {
    icon: Calendar,
    title: "Hora de atualizar!",
    description: "Faz tempo que você não envia extratos. Mantenha seu relatório em dia.",
    buttonText: "Enviar Arquivos",
    href: "/uploads",
    variant: "secondary",
    colorClass: "bg-muted text-muted-foreground",
  },
  all_done: {
    icon: CheckCircle2,
    title: "Você está em dia!",
    description: "Tudo categorizado. Próximo ritual: Quarta-feira.",
    buttonText: "Ver Relatório",
    href: "/report",
    variant: "secondary",
    colorClass: "bg-success/10 text-success",
  },
};

export function NextStepCard({ 
  stepType, 
  pendingCount = 0, 
  daysSinceLastUpload = 0,
  weekProgress = 1,
  isFirstMonth = false,
}: NextStepCardProps) {
  const config = stepConfig[stepType];
  const Icon = config.icon;

  // Dynamic description based on context
  let description = config.description;
  if (stepType === "categorize" && pendingCount > 0) {
    description = `Você tem ${pendingCount} transaç${pendingCount === 1 ? 'ão' : 'ões'} aguardando categorização.`;
  }
  if (stepType === "upload_reminder" && daysSinceLastUpload > 0) {
    description = `Último upload há ${daysSinceLastUpload} dia${daysSinceLastUpload === 1 ? '' : 's'}. Mantenha seu relatório atualizado!`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card variant="glass" className="overflow-hidden border-primary/20">
        <CardContent className="p-0">
          {/* Progress bar for month */}
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Progresso do mês</span>
              <span>Semana {weekProgress}/4</span>
            </div>
            <Progress value={weekProgress * 25} className="h-1.5" />
          </div>

          {/* Main content */}
          <div className="p-6 pt-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${config.colorClass} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {isFirstMonth && (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Primeiro mês
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-1">
                  {config.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {description}
                </p>
                <Link to={config.href}>
                  <Button variant={config.variant} size="sm" className="gap-2">
                    {config.buttonText}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick tip for new users */}
          {isFirstMonth && stepType === "day1_ritual" && (
            <div className="px-6 pb-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Dica:</span> O Ritual Dia 1 é onde você define quanto quer gastar em cada categoria. Leva ~10 minutos.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Helper function to determine the current step
export function determineNextStep({
  hasMonth,
  monthClosed,
  pendingCount,
  hasUploads,
  daysSinceLastUpload,
  isFirstDayOfMonth,
}: {
  hasMonth: boolean;
  monthClosed: boolean;
  pendingCount: number;
  hasUploads: boolean;
  daysSinceLastUpload: number;
  isFirstDayOfMonth: boolean;
}): NextStepType {
  // Priority 1: Day 1 ritual (first days of month or no month yet)
  if (!hasMonth || (!monthClosed && isFirstDayOfMonth)) {
    return "day1_ritual";
  }

  // Priority 2: Pending transactions to categorize
  if (pendingCount > 0) {
    return "categorize";
  }

  // Priority 3: Wednesday = weekly upload day
  const isWednesday = new Date().getDay() === 3;
  if (isWednesday && hasUploads) {
    return "weekly_upload";
  }

  // Priority 4: Long time since last upload
  if (daysSinceLastUpload >= 5) {
    return "upload_reminder";
  }

  // Default: All done!
  return "all_done";
}
