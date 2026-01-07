import { List, Calendar, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ViewMode } from '@/types/task';

interface AppSidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  taskCounts: {
    total: number;
    completed: number;
  };
}

export function AppSidebar({ currentView, onViewChange, taskCounts }: AppSidebarProps) {
  const navItems = [
    { id: 'list' as ViewMode, label: 'Tasks', icon: List },
    { id: 'calendar' as ViewMode, label: 'Calendar', icon: Calendar },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-sidebar p-4 flex flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-2.5 px-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <CheckSquare className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">TaskFlow</span>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              currentView === item.id
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-border">
        <div className="px-3 py-2 rounded-lg bg-muted/50">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Progress
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-foreground">
              {taskCounts.completed}
            </span>
            <span className="text-sm text-muted-foreground">
              / {taskCounts.total} completed
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{
                width: taskCounts.total > 0
                  ? `${(taskCounts.completed / taskCounts.total) * 100}%`
                  : '0%',
              }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
