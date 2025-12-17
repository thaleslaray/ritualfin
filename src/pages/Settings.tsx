import { motion } from "framer-motion";
import { 
  User, 
  CreditCard, 
  Tag, 
  Bell, 
  Shield, 
  HelpCircle,
  ChevronRight,
  LogOut,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type SettingsItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  action?: () => void;
};

type SettingsGroup = {
  title: string;
  items: SettingsItem[];
};

const Settings = () => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const comingSoon = () => toast.info("Em breve!");

  const settingsGroups: SettingsGroup[] = [
    {
      title: "Conta",
      items: [
        { icon: User, label: "Perfil", description: "Editar informações pessoais", action: comingSoon },
        { icon: Users, label: "Casal", description: "Gerenciar parceiro vinculado", action: comingSoon },
      ],
    },
    {
      title: "Financeiro",
      items: [
        { icon: CreditCard, label: "Cartões", description: "Gerenciar cartões e limites", action: comingSoon },
        { icon: Tag, label: "Categorias", description: "Personalizar categorias", action: comingSoon },
      ],
    },
    {
      title: "Preferências",
      items: [
        { icon: Bell, label: "Notificações", description: "Configurar lembretes", action: comingSoon },
        { icon: Shield, label: "Privacidade", description: "Segurança e LGPD", action: comingSoon },
      ],
    },
    {
      title: "Suporte",
      items: [
        { icon: HelpCircle, label: "Ajuda", description: "FAQ e tutoriais", action: comingSoon },
      ],
    },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || "??";
  };

  const displayName = profile?.full_name || user?.email || "Usuário";
  const displayEmail = user?.email || "";
  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    : "";

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Gerencie sua conta e preferências
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">{displayName}</h3>
                  <p className="text-sm text-muted-foreground">{displayEmail}</p>
                  {memberSince && (
                    <p className="text-xs text-muted-foreground mt-1">Membro desde {memberSince}</p>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + groupIndex * 0.1 }}
          >
            <Card variant="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground">{group.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {group.items.map((item, itemIndex) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                      itemIndex !== group.items.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button 
            variant="outline" 
            className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Sair da conta
          </Button>
        </motion.div>

        {/* Version */}
        <motion.p
          className="text-center text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Ritual Financeiro do Casal v1.0.0
        </motion.p>
      </div>
    </AppLayout>
  );
};

export default Settings;
