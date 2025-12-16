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
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const settingsGroups = [
  {
    title: "Conta",
    items: [
      { icon: User, label: "Perfil", description: "Editar informações pessoais" },
      { icon: Users, label: "Casal", description: "Gerenciar parceiro vinculado" },
    ],
  },
  {
    title: "Financeiro",
    items: [
      { icon: CreditCard, label: "Cartões", description: "Gerenciar cartões e limites" },
      { icon: Tag, label: "Categorias", description: "Personalizar categorias" },
    ],
  },
  {
    title: "Preferências",
    items: [
      { icon: Bell, label: "Notificações", description: "Configurar lembretes" },
      { icon: Shield, label: "Privacidade", description: "Segurança e LGPD" },
    ],
  },
  {
    title: "Suporte",
    items: [
      { icon: HelpCircle, label: "Ajuda", description: "FAQ e tutoriais" },
    ],
  },
];

const Settings = () => {
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
                    JM
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">João & Maria</h3>
                  <p className="text-sm text-muted-foreground">joao@email.com</p>
                  <p className="text-xs text-muted-foreground mt-1">Membro desde Nov 2024</p>
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
          <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
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
