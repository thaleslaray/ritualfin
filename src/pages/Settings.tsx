import { useState } from "react";
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
  Users,
  Database,
  Copy,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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

  const [dbUrl, setDbUrl] = useState<string | null>(null);
  const [showDbUrl, setShowDbUrl] = useState(false);
  const [loadingDbUrl, setLoadingDbUrl] = useState(false);

  const comingSoon = () => toast.info("Em breve!");

  const fetchDbUrl = async () => {
    setLoadingDbUrl(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-db-url');
      if (error) throw error;
      if (data?.db_url) {
        setDbUrl(data.db_url);
        setShowDbUrl(true);
      } else {
        toast.error("DB URL não disponível");
      }
    } catch (err) {
      console.error('Erro ao buscar DB URL:', err);
      toast.error("Erro ao buscar DB URL");
    } finally {
      setLoadingDbUrl(false);
    }
  };

  const copyDbUrl = () => {
    if (dbUrl) {
      navigator.clipboard.writeText(dbUrl);
      toast.success("DB URL copiada!");
    }
  };

  const settingsGroups: SettingsGroup[] = [
    {
      title: "CONTA",
      items: [
        { icon: User, label: "Perfil", description: "Informações pessoais", action: comingSoon },
        { icon: Users, label: "Parceiro", description: "Gerenciar vínculo", action: comingSoon },
      ],
    },
    {
      title: "FINANCEIRO",
      items: [
        { icon: CreditCard, label: "Cartões", description: "Gerenciar cartões", action: comingSoon },
        { icon: Tag, label: "Categorias", description: "Personalizar", action: () => navigate("/categories") },
      ],
    },
    {
      title: "PREFERÊNCIAS",
      items: [
        { icon: Bell, label: "Notificações", description: "Lembretes", action: comingSoon },
        { icon: Shield, label: "Privacidade", description: "Segurança e LGPD", action: comingSoon },
      ],
    },
    {
      title: "SUPORTE",
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
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-display text-foreground">
            Configurações
          </h1>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 rounded-2xl">
                  <AvatarFallback className="bg-foreground text-background text-xl rounded-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-title text-foreground">{displayName}</h3>
                  <p className="text-caption text-muted-foreground">{displayEmail}</p>
                  {memberSince && (
                    <p className="text-footnote text-muted-foreground mt-1">Membro desde {memberSince}</p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
            transition={{ delay: 0.15 + groupIndex * 0.05 }}
          >
            <p className="text-footnote font-semibold text-muted-foreground tracking-wider mb-3 px-1">
              {group.title}
            </p>
            <Card>
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
                      <p className="text-body text-foreground font-medium">{item.label}</p>
                      <p className="text-caption text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Developer Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <p className="text-footnote font-semibold text-muted-foreground tracking-wider mb-3 px-1">
            DESENVOLVEDOR
          </p>
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Database className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-body text-foreground font-medium">Database URL</p>
                  <p className="text-caption text-muted-foreground">Connection string para migração</p>
                </div>
              </div>
              
              {dbUrl && showDbUrl ? (
                <div className="space-y-2">
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-xs text-foreground break-all">{dbUrl}</code>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={copyDbUrl}
                    >
                      <Copy className="w-4 h-4" />
                      Copiar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowDbUrl(false)}
                    >
                      <EyeOff className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : dbUrl ? (
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => setShowDbUrl(true)}
                >
                  <Eye className="w-4 h-4" />
                  Mostrar URL
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={fetchDbUrl}
                  disabled={loadingDbUrl}
                >
                  {loadingDbUrl ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4" />
                  )}
                  {loadingDbUrl ? "Carregando..." : "Obter DB URL"}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
          className="text-center text-footnote text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Ritual Financeiro v1.0.0
        </motion.p>
      </div>
    </AppLayout>
  );
};

export default Settings;
