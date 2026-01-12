import { List, Calendar, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ViewMode } from '@/types/task';
import { useAuth } from '@/contexts/AuthContext';

interface MobileNavProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function MobileNav({ currentView, onViewChange }: MobileNavProps) {
  const { signOut } = useAuth();

  const navItems = [
    { id: 'list' as ViewMode, label: 'Tasks', icon: List },
    { id: 'calendar' as ViewMode, label: 'Calendar', icon: Calendar },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm md:hidden">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              'flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors',
              currentView === item.id
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs font-medium">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
