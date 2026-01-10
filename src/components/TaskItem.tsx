import { useState, useRef } from 'react';
import { format, isToday, isTomorrow, isPast, differenceInMinutes, differenceInHours, setHours, setMinutes } from 'date-fns';
import { Check, Pencil, Trash2, Clock, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Task, Priority } from '@/types/task';
import { TaskForm } from './TaskForm';
import { formatTime } from './TimePicker';
import { getRecurrenceLabel } from './RecurrenceSelector';
import { useConfetti } from './animations/Confetti';
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
  index?: number;
}

const priorityStyles: Record<Priority, { bg: string; text: string; border: string; glow: string }> = {
  high: {
    bg: 'bg-priority-high-bg',
    text: 'text-priority-high',
    border: 'border-priority-high/30',
    glow: 'hover:shadow-[0_0_20px_hsl(0_85%_60%/0.2)]',
  },
  medium: {
    bg: 'bg-priority-medium-bg',
    text: 'text-priority-medium',
    border: 'border-priority-medium/30',
    glow: 'hover:shadow-[0_0_20px_hsl(38_95%_50%/0.2)]',
  },
  low: {
    bg: 'bg-priority-low-bg',
    text: 'text-priority-low',
    border: 'border-priority-low/30',
    glow: 'hover:shadow-[0_0_20px_hsl(160_80%_42%/0.2)]',
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

export function TaskItem({ task, onToggle, onUpdate, onDelete, onDeleteSeries, compact, index = 0 }: TaskItemProps) {
  const styles = priorityStyles[task.priority];
  const dueDate = new Date(task.dueDate);
  const checkboxRef = useRef<HTMLButtonElement>(null);
  const { burst } = useConfetti();
  const [isCompleting, setIsCompleting] = useState(false);
  
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
    if (!task.completed) {
      setIsCompleting(true);
      // Trigger confetti at checkbox position
      if (checkboxRef.current) {
        const rect = checkboxRef.current.getBoundingClientRect();
        burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
      setTimeout(() => {
        setIsCompleting(false);
        if (isRecurring) {
          onToggle(task.id, false);
        } else {
          onToggle(task.id);
        }
      }, 300);
    } else {
      onToggle(task.id);
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'flex items-center gap-2 p-2 rounded-lg border bg-card text-sm transition-all',
          'hover:shadow-soft',
          task.completed && 'opacity-60',
          isOverdue && 'border-destructive/30 bg-destructive/5',
          isDueSoon && 'border-amber-500/30 bg-amber-500/5'
        )}
      >
        <button
          ref={checkboxRef}
          onClick={handleComplete}
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all',
            task.completed ? 'bg-primary border-primary' : 'border-muted-foreground/40 hover:border-primary hover:scale-110'
          )}
        >
          <AnimatePresence>
            {task.completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <Check className="h-2.5 w-2.5 text-primary-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
        <span className={cn('flex-1 truncate', task.completed && 'line-through')}>
          {task.title}
        </span>
        {task.dueTime && !task.allDay && (
          <span className="text-xs text-muted-foreground">{formatTime(task.dueTime)}</span>
        )}
        {isRecurring && <Repeat className="h-3 w-3 text-muted-foreground" />}
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, x: -20 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={cn(
        'group relative flex items-start gap-4 p-4 rounded-xl border bg-card transition-all duration-300',
        'hover:shadow-card hover:-translate-y-0.5 pulse-glow',
        styles.glow,
        task.completed && 'opacity-60',
        isOverdue && 'border-destructive/30 bg-destructive/5',
        isDueSoon && 'border-amber-500/30 bg-amber-500/5',
        isCompleting && 'scale-[1.02] shadow-card'
      )}
    >
      <motion.button
        ref={checkboxRef}
        onClick={handleComplete}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          task.completed
            ? 'bg-primary border-primary'
            : cn('border-muted-foreground/40 hover:border-primary', styles.border)
        )}
      >
        <AnimatePresence>
          {task.completed && (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <Check className="h-3 w-3 text-primary-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              'font-medium text-foreground leading-tight transition-all',
              task.completed && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </h3>
          {isRecurring && (
            <motion.span 
              className="flex items-center gap-1 text-xs text-muted-foreground" 
              title={getRecurrenceLabel(task.recurrence)}
              whileHover={{ scale: 1.1 }}
            >
              <Repeat className="h-3 w-3" />
            </motion.span>
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
              <motion.span 
                className="text-amber-600 font-semibold"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ({relativeTime})
              </motion.span>
            )}
          </span>
          <motion.span
            whileHover={{ scale: 1.05 }}
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium capitalize transition-colors',
              styles.bg,
              styles.text
            )}
          >
            {task.priority}
          </motion.span>
          {task.allDay && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              All Day
            </span>
          )}
        </div>
      </div>

      <motion.div 
        className="flex items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <TaskForm
            initialTask={task}
            onSubmit={(updates) => onUpdate(task.id, updates)}
            trigger={
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent">
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          {isRecurring && task.seriesId && onDeleteSeries ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="animate-scale-in">
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
              className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}