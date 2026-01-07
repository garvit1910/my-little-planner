import { Task, SortBy } from '@/types/task';
import { TaskItem } from './TaskItem';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowUpDown, Calendar, Flag, Clock } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
}

const sortOptions: { value: SortBy; label: string; icon: React.ReactNode }[] = [
  { value: 'dueDate', label: 'Due Date', icon: <Calendar className="h-4 w-4" /> },
  { value: 'priority', label: 'Priority', icon: <Flag className="h-4 w-4" /> },
  { value: 'createdAt', label: 'Created', icon: <Clock className="h-4 w-4" /> },
];

export function TaskList({
  tasks,
  onToggle,
  onUpdate,
  onDelete,
  sortBy,
  onSortChange,
}: TaskListProps) {
  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-6">
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

      {incompleteTasks.length === 0 && completedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No tasks yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first task to get started
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
