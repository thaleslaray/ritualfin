import { 
  Sparkles, 
  ListChecks, 
  Upload, 
  CheckCircle2, 
  Calendar,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export type NextStepType = 
  | "day1_ritual"
  | "categorize"
  | "weekly_upload"
  | "upload_reminder"
  | "all_done";

interface NextStepCardProps {
  stepType: NextStepType;
  pendingCount?: number;
  daysSinceLastUpload?: number;
  weekProgress?: number;
  isFirstMonth?: boolean;
}

const stepConfig: Record<NextStepType, {
  icon: typeof Sparkles;
  title: string;
  description: string;
  buttonText: string;
  href: string;
}> = {
  day1_ritual: {
    icon: Sparkles,
    title: "Hora do Ritual Dia 1",
    description: "Revise seu orçamento e feche o mês.",
    buttonText: "Iniciar",
    href: "/budget",
  },
  categorize: {
    icon: ListChecks,
    title: "Transações pendentes",
    description: "Você tem transações aguardando.",
    buttonText: "Categorizar",
    href: "/transactions",
  },
  weekly_upload: {
    icon: Upload,
    title: "Ritual Semanal",
    description: "Envie os prints das faturas.",
    buttonText: "Enviar",
    href: "/uploads",
  },
  upload_reminder: {
    icon: Calendar,
    title: "Hora de atualizar",
    description: "Mantenha seu relatório em dia.",
    buttonText: "Enviar",
    href: "/uploads",
  },
  all_done: {
    icon: CheckCircle2,
    title: "Você está em dia",
    description: "Próximo ritual: Quarta-feira.",
    buttonText: "Ver Relatório",
    href: "/report",
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

  let description = config.description;
  if (stepType === "categorize" && pendingCount > 0) {
    description = `${pendingCount} transaç${pendingCount === 1 ? 'ão' : 'ões'} pendente${pendingCount === 1 ? '' : 's'}.`;
  }
  if (stepType === "upload_reminder" && daysSinceLastUpload > 0) {
    description = `Último upload há ${daysSinceLastUpload} dia${daysSinceLastUpload === 1 ? '' : 's'}.`;
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-caption text-muted-foreground mb-2">
            <span>Semana {weekProgress}/4</span>
          </div>
          <Progress value={weekProgress * 25} className="h-1" />
        </div>

        {/* Content */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-body font-medium text-foreground mb-1">
              {config.title}
            </h3>
            <p className="text-caption text-muted-foreground mb-3">
              {description}
            </p>
            <Link to={config.href}>
              <Button size="sm">
                {config.buttonText}
              </Button>
            </Link>
          </div>
        </div>

        {/* Tip for new users */}
        {isFirstMonth && stepType === "day1_ritual" && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-caption text-muted-foreground">
                Defina quanto gastar em cada categoria. Leva ~10 minutos.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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
  if (!hasMonth || (!monthClosed && isFirstDayOfMonth)) {
    return "day1_ritual";
  }
  if (pendingCount > 0) {
    return "categorize";
  }
  const isWednesday = new Date().getDay() === 3;
  if (isWednesday && hasUploads) {
    return "weekly_upload";
  }
  if (daysSinceLastUpload >= 5) {
    return "upload_reminder";
  }
  return "all_done";
}
