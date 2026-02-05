import { Home, Heart, BookOpen, User } from "lucide-react";
import { PlanType } from "@shared/schema";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  plan: PlanType;
}

interface NavButtonProps {
  icon: typeof Home;
  label: string;
  tab: string;
  isActive: boolean;
  onClick: () => void;
}

function NavButton({ icon: Icon, label, tab, isActive, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
        isActive
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-gray-500 dark:text-gray-400"
      }`}
      data-testid={`button-bottom-nav-${tab}`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

export function BottomNav({ activeTab, onTabChange, plan }: BottomNavProps) {
  const items: { icon: typeof Home; label: string; tab: string }[] = [
    { icon: Home, label: "Chat", tab: "chat" },
  ];

  if (plan === "conexao" || plan === "plenitude") {
    items.push({ icon: Heart, label: "Coração", tab: "radar" });
  }

  if (plan === "plenitude") {
    items.push({ icon: BookOpen, label: "Diário", tab: "diario" });
  }

  items.push({ icon: User, label: "Perfil", tab: "profile" });

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t z-50 md:hidden safe-area-bottom" data-testid="nav-bottom">
      <div className="flex">
        {items.map((item) => (
          <NavButton
            key={item.tab}
            icon={item.icon}
            label={item.label}
            tab={item.tab}
            isActive={activeTab === item.tab}
            onClick={() => onTabChange(item.tab)}
          />
        ))}
      </div>
    </nav>
  );
}
