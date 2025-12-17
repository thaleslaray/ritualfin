import { Sidebar } from "@/components/layout/Sidebar";
import { ReactNode } from "react";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-0 pt-14 lg:pt-0">
        <div className="min-h-screen p-6 lg:p-12 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
