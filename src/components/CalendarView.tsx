import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Task, Priority } from '@/types/task';
import { TaskItem } from './TaskItem';

interface CalendarViewProps {
  tasks: Task[];
  getTasksForDate: (date: Date) => Task[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const priorityDotStyles: Record<Priority, string> = {
  high: 'bg-priority-high',
  medium: 'bg-priority-medium',
  low: 'bg-priority-low',
};

export function CalendarView({
  tasks,
  getTasksForDate,
  onToggle,
  onUpdate,
  onDelete,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden bg-border shadow-soft">
        {/* Weekday Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((weekday) => (
          <div
            key={weekday}
            className="bg-muted py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider"
          >
            {weekday}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((date) => {
          const dayTasks = getTasksForDate(date);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isSelected = selectedDate && isSameDay(date, selectedDate);

          return (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(isSelected ? null : date)}
              className={cn(
                'relative min-h-[100px] bg-card p-2 text-left transition-colors hover:bg-accent/50',
                !isCurrentMonth && 'bg-muted/50 text-muted-foreground',
                isSelected && 'bg-accent ring-2 ring-primary ring-inset'
              )}
            >
              <span
                className={cn(
                  'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm',
                  isToday(date) && 'bg-primary text-primary-foreground font-medium'
                )}
              >
                {format(date, 'd')}
              </span>

              {/* Task Indicators */}
              {dayTasks.length > 0 && (
                <div className="mt-1 space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        'flex items-center gap-1.5 px-1.5 py-0.5 rounded text-xs truncate',
                        task.completed
                          ? 'bg-muted text-muted-foreground line-through'
                          : cn(
                              task.priority === 'high' && 'bg-priority-high-bg text-priority-high',
                              task.priority === 'medium' && 'bg-priority-medium-bg text-priority-medium',
                              task.priority === 'low' && 'bg-priority-low-bg text-priority-low'
                            )
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full shrink-0',
                          priorityDotStyles[task.priority]
                        )}
                      />
                      <span className="truncate">{task.title}</span>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-xs text-muted-foreground pl-1">
                      +{dayTasks.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Tasks */}
      {selectedDate && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-foreground">
              Tasks for {format(selectedDate, 'EEEE, MMMM d')}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSelectedDate(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {selectedTasks.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center bg-muted/50 rounded-xl">
              No tasks scheduled for this day
            </p>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
