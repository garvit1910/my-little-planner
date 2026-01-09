import { format, isToday, isTomorrow, isPast, differenceInMinutes, differenceInHours, setHours, setMinutes } from 'date-fns';
import { Check, Pencil, Trash2, Clock, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Task, Priority } from '@/types/task';
import { TaskForm } from './TaskForm';
import { formatTime } from './TimePicker';
import { getRecurrenceLabel } from './RecurrenceSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completeAllFuture?: boolean) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onDeleteSeries?: (seriesId: string) => void;
  compact?: boolean;
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

function formatDueDate(date: Date, time?: string): string {
  if (isToday(date)) {
    return time ? `Today at ${formatTime(time)}` : 'Today';
  }
  if (isTomorrow(date)) {
    return time ? `Tomorrow at ${formatTime(time)}` : 'Tomorrow';
  }
  return time ? `${format(date, 'MMM d')} at ${formatTime(time)}` : format(date, 'MMM d');
}

function getRelativeTime(date: Date, time?: string): string | null {
  if (!time) return null;
  
  const [hours, minutes] = time.split(':').map(Number);
  const taskDateTime = setMinutes(setHours(new Date(date), hours), minutes);
  const now = new Date();
  
  if (isPast(taskDateTime)) return null;
  
  const minutesDiff = differenceInMinutes(taskDateTime, now);
  const hoursDiff = differenceInHours(taskDateTime, now);
  
  if (minutesDiff < 60) {
    return `in ${minutesDiff} min`;
  }
  if (hoursDiff < 24) {
    return `in ${hoursDiff} hr${hoursDiff !== 1 ? 's' : ''}`;
  }
  return null;
}

export function TaskItem({ task, onToggle, onUpdate, onDelete, onDeleteSeries, compact }: TaskItemProps) {
  const styles = priorityStyles[task.priority];
  const dueDate = new Date(task.dueDate);
  
  const getTaskDateTime = () => {
    if (task.allDay || !task.dueTime) return dueDate;
    const [hours, minutes] = task.dueTime.split(':').map(Number);
    return setMinutes(setHours(dueDate, hours), minutes);
  };
  
  const isOverdue = isPast(getTaskDateTime()) && !isToday(dueDate) && !task.completed;
  const isDueSoon = !task.completed && !task.allDay && task.dueTime && (() => {
    const taskDateTime = getTaskDateTime();
    const minutesDiff = differenceInMinutes(taskDateTime, new Date());
    return minutesDiff > 0 && minutesDiff <= 60;
  })();
  
  const relativeTime = getRelativeTime(dueDate, task.dueTime);
  const isRecurring = task.recurrence && task.recurrence.type !== 'none';

  const handleComplete = () => {
    if (isRecurring && !task.completed) {
      // For recurring tasks, show options
      onToggle(task.id, false);
    } else {
      onToggle(task.id);
    }
  };

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 p-2 rounded-lg border bg-card text-sm',
          task.completed && 'opacity-60',
          isOverdue && 'border-destructive/30 bg-destructive/5',
          isDueSoon && 'border-amber-500/30 bg-amber-500/5'
        )}
      >
        <button
          onClick={handleComplete}
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all',
            task.completed ? 'bg-primary border-primary' : 'border-muted-foreground/40'
          )}
        >
          {task.completed && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
        </button>
        <span className={cn('flex-1 truncate', task.completed && 'line-through')}>
          {task.title}
        </span>
        {task.dueTime && !task.allDay && (
          <span className="text-xs text-muted-foreground">{formatTime(task.dueTime)}</span>
        )}
        {isRecurring && <Repeat className="h-3 w-3 text-muted-foreground" />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative flex items-start gap-4 p-4 rounded-xl border bg-card transition-all duration-200',
        'hover:shadow-card',
        task.completed && 'opacity-60',
        isOverdue && 'border-destructive/30 bg-destructive/5',
        isDueSoon && 'border-amber-500/30 bg-amber-500/5 animate-pulse'
      )}
    >
      <button
        onClick={handleComplete}
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
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              'font-medium text-foreground leading-tight',
              task.completed && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </h3>
          {isRecurring && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground" title={getRecurrenceLabel(task.recurrence)}>
              <Repeat className="h-3 w-3" />
            </span>
          )}
        </div>
        {task.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-medium',
              isOverdue ? 'text-destructive' : isDueSoon ? 'text-amber-600' : 'text-muted-foreground'
            )}
          >
            <Clock className="h-3 w-3" />
            {formatDueDate(dueDate, task.dueTime)}
            {relativeTime && (
              <span className="text-amber-600 font-semibold">({relativeTime})</span>
            )}
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
          {task.allDay && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              All Day
            </span>
          )}
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
        {isRecurring && task.seriesId && onDeleteSeries ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDelete(task.id)}>
                Delete this occurrence
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDeleteSeries(task.seriesId!)}
                className="text-destructive"
              >
                Delete all occurrences
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-destructive"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
