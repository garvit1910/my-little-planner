import { List, Calendar, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
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

  const progressPercent = taskCounts.total > 0 ? (taskCounts.completed / taskCounts.total) * 100 : 0;

  return (
    <motion.aside 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-64 shrink-0 border-r border-border glass-strong p-4 flex flex-col"
    >
      <div className="mb-8">
        <div className="flex items-center gap-2.5 px-2">
          <motion.div 
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--gradient-primary)' }}
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <CheckSquare className="h-4 w-4 text-white" />
          </motion.div>
          <span className="text-lg font-bold text-gradient">TaskFlow</span>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item, index) => (
          <motion.button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              currentView === item.id
                ? 'bg-primary/10 text-primary shadow-soft'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
            {currentView === item.id && (
              <motion.div
                layoutId="activeTab"
                className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
              />
            )}
          </motion.button>
        ))}
      </nav>

      <motion.div 
        className="mt-auto pt-6 border-t border-border"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="px-3 py-3 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 shadow-soft">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Progress
          </div>
          <div className="flex items-baseline gap-1">
            <motion.span 
              className="text-2xl font-bold text-foreground"
              key={taskCounts.completed}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              {taskCounts.completed}
            </motion.span>
            <span className="text-sm text-muted-foreground">
              / {taskCounts.total} completed
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-border overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--gradient-primary)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>
    </motion.aside>
  );
}