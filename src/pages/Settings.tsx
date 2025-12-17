import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

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

  return (
    <AppLayout>
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <h1 className="text-headline text-foreground">
          Configurações
        </h1>

        {/* Profile */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-foreground text-background flex items-center justify-center font-medium">
                {getInitials()}
              </div>
              <div>
                <p className="text-body font-medium text-foreground">{displayName}</p>
                <p className="text-caption text-muted-foreground">{displayEmail}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleLogout}
        >
          Sair da conta
        </Button>

        {/* Version */}
        <p className="text-center text-caption text-muted-foreground">
          v1.0.0
        </p>
      </div>
    </AppLayout>
  );
};

export default Settings;
