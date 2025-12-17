import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

/* Dieter Rams: Text-only navigation, no icons */
const navItems = [
  { label: "Início", path: "/" },
  { label: "Orçamento", path: "/budget" },
  { label: "Uploads", path: "/uploads" },
  { label: "Transações", path: "/transactions" },
  { label: "Relatório", path: "/report" },
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
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-12 bg-background border-b border-border z-50 px-4 flex items-center justify-between">
        <span className="text-body font-medium">Ritual</span>
        <Button variant="ghost" size="icon-sm" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-foreground/5 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-56 bg-background border-r border-border z-50 lg:z-0 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } transition-transform duration-150`}
      >
        {/* Logo - text only */}
        <div className="p-6 pb-8">
          <span className="text-headline">Ritual</span>
        </div>

        {/* Navigation - text only */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                <div
                  className={`px-3 py-2 rounded-md text-body transition-colors ${
                    isActive
                      ? "bg-foreground text-background font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 space-y-1 border-t border-border">
          <Link to="/settings" onClick={() => setIsOpen(false)}>
            <div
              className={`px-3 py-2 rounded-md text-body transition-colors ${
                location.pathname === "/settings"
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Configurações
            </div>
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-md text-body text-left text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Sair
          </button>
        </div>
      </aside>
    </>
  );
};
