import { Task, SortBy } from '@/types/task';
import { TaskItem } from './TaskItem';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowUpDown, Calendar, Flag, Clock, Repeat, Filter } from 'lucide-react';
import { useState } from 'react';
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <div className="flex gap-1">
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  'gap-1.5 h-8',
                  sortBy === option.value && 'bg-secondary'
                )}
                onClick={() => onSortChange(option.value)}
              >
                {option.icon}
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-8">
              <Filter className="h-4 w-4" />
              {filter === 'all' ? 'All Tasks' : 
               filter === 'recurring' ? 'Recurring' : 
               filter === 'one-time' ? 'One-time' : 'Overdue'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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

      {incompleteTasks.length === 0 && completedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">
            {filter === 'all' ? 'No tasks yet' : 'No matching tasks'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {filter === 'all' 
              ? 'Create your first task to get started'
              : 'Try changing the filter to see more tasks'}
          </p>
        </div>
      ) : (
        <>
          {incompleteTasks.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                To Do ({incompleteTasks.length})
              </h2>
              <div className="space-y-2">
                {incompleteTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onDeleteSeries={onDeleteSeries}
                  />
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Completed ({completedTasks.length})
              </h2>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onDeleteSeries={onDeleteSeries}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
