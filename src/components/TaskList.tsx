import { Task, SortBy } from '@/types/task';
import { TaskItem } from './TaskItem';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowUpDown, Calendar, Flag, Clock, Repeat, Filter } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from './EmptyState';
import { FadeIn } from './animations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string, completeAllFuture?: boolean) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onDeleteSeries?: (seriesId: string) => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
}

const sortOptions: { value: SortBy; label: string; icon: React.ReactNode }[] = [
  { value: 'dueDate', label: 'Due Date', icon: <Calendar className="h-4 w-4" /> },
  { value: 'priority', label: 'Priority', icon: <Flag className="h-4 w-4" /> },
  { value: 'createdAt', label: 'Created', icon: <Clock className="h-4 w-4" /> },
];

type FilterType = 'all' | 'recurring' | 'one-time' | 'overdue';

export function TaskList({
  tasks,
  onToggle,
  onUpdate,
  onDelete,
  onDeleteSeries,
  sortBy,
  onSortChange,
}: TaskListProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTasks = tasks.filter((task) => {
    switch (filter) {
      case 'recurring':
        return task.recurrence && task.recurrence.type !== 'none';
      case 'one-time':
        return !task.recurrence || task.recurrence.type === 'none';
      case 'overdue':
        const now = new Date();
        const taskDate = new Date(task.dueDate);
        return !task.completed && taskDate < now && 
          !(taskDate.getFullYear() === now.getFullYear() && 
            taskDate.getMonth() === now.getMonth() && 
            taskDate.getDate() === now.getDate());
      default:
        return true;
    }
  });

  const incompleteTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <div className="flex gap-1">
              {sortOptions.map((option) => (
                <motion.div key={option.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant={sortBy === option.value ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(
                      'gap-1.5 h-8 transition-all',
                      sortBy === option.value && 'bg-secondary shadow-soft'
                    )}
                    onClick={() => onSortChange(option.value)}
                  >
                    {option.icon}
                    {option.label}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-8 shadow-soft hover:shadow-card transition-shadow">
                <Filter className="h-4 w-4" />
                {filter === 'all' ? 'All Tasks' : 
                 filter === 'recurring' ? 'Recurring' : 
                 filter === 'one-time' ? 'One-time' : 'Overdue'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="animate-scale-in">
              <DropdownMenuItem onClick={() => setFilter('all')}>
                All Tasks
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter('recurring')}>
                <Repeat className="h-4 w-4 mr-2" />
                Recurring Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('one-time')}>
                One-time Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('overdue')} className="text-destructive">
                Overdue Tasks
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </FadeIn>

      {incompleteTasks.length === 0 && completedTasks.length === 0 ? (
        <EmptyState type={filter === 'all' ? 'tasks' : 'filtered'} />
      ) : (
        <>
          {incompleteTasks.length > 0 && (
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h2 
                className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                To Do ({incompleteTasks.length})
              </motion.h2>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {incompleteTasks.map((task, index) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={onToggle}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onDeleteSeries={onDeleteSeries}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {completedTasks.length > 0 && (
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <motion.h2 
                className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Completed ({completedTasks.length})
              </motion.h2>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {completedTasks.map((task, index) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={onToggle}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onDeleteSeries={onDeleteSeries}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}