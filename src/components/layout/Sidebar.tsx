import { motion } from "framer-motion";
import { 
  Home, 
  FileText, 
  Upload, 
  Inbox, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X 
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: FileText, label: "Orçamento", path: "/budget" },
  { icon: Upload, label: "Uploads", path: "/uploads" },
  { icon: Inbox, label: "Transações", path: "/transactions" },
  { icon: BarChart3, label: "Relatório", path: "/report" },
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <>
      {/* Mobile header - Frosted glass */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur-xl border-b border-border/50 z-50 px-4 flex items-center justify-between">
        <Logo />
        <Button 
          variant="ghost" 
          size="icon-sm" 
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <motion.div 
          className="lg:hidden fixed inset-0 bg-foreground/10 backdrop-blur-sm z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-sidebar border-r border-sidebar-border z-50 lg:z-0 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } transition-transform duration-300 ease-apple`}
      >
        {/* Logo */}
        <div className="p-6 pb-8">
          <Logo />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                <motion.div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                  <span className="font-medium text-[15px]">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 space-y-1 border-t border-sidebar-border">
          <Link to="/settings" onClick={() => setIsOpen(false)}>
            <motion.div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                location.pathname === "/settings"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <Settings className="w-5 h-5" strokeWidth={location.pathname === "/settings" ? 2 : 1.5} />
              <span className="font-medium text-[15px]">Configurações</span>
            </motion.div>
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            <span className="font-medium text-[15px]">Sair</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};
