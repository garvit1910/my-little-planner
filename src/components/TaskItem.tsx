import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Check, Pencil, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Task, Priority } from '@/types/task';
import { TaskForm } from './TaskForm';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const priorityStyles: Record<Priority, { bg: string; text: string; border: string }> = {
  high: {
    bg: 'bg-priority-high-bg',
    text: 'text-priority-high',
    border: 'border-priority-high/30',
  },
  medium: {
    bg: 'bg-priority-medium-bg',
    text: 'text-priority-medium',
    border: 'border-priority-medium/30',
  },
  low: {
    bg: 'bg-priority-low-bg',
    text: 'text-priority-low',
    border: 'border-priority-low/30',
  },
};

function formatDueDate(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM d');
}

export function TaskItem({ task, onToggle, onUpdate, onDelete }: TaskItemProps) {
  const styles = priorityStyles[task.priority];
  const dueDate = new Date(task.dueDate);
  const isOverdue = isPast(dueDate) && !isToday(dueDate) && !task.completed;

  return (
    <div
      className={cn(
        'group relative flex items-start gap-4 p-4 rounded-xl border bg-card transition-all duration-200',
        'hover:shadow-card',
        task.completed && 'opacity-60'
      )}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
          task.completed
            ? 'bg-primary border-primary'
            : cn('border-muted-foreground/40 hover:border-primary', styles.border)
        )}
      >
        {task.completed && (
          <Check className="h-3 w-3 text-primary-foreground animate-check-bounce" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            'font-medium text-foreground leading-tight',
            task.completed && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </h3>
        {task.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-3">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-medium',
              isOverdue ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            <Clock className="h-3 w-3" />
            {formatDueDate(dueDate)}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium capitalize',
              styles.bg,
              styles.text
            )}
          >
            {task.priority}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <TaskForm
          initialTask={task}
          onSubmit={(updates) => onUpdate(task.id, updates)}
          trigger={
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
          }
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:text-destructive"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
