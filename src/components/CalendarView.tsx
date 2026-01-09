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
  setHours,
  setMinutes,
} from 'date-fns';
import { ChevronLeft, ChevronRight, X, Clock, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Task, Priority, TIME_SLOT_RANGES, TimeSlot } from '@/types/task';
import { TaskItem } from './TaskItem';
import { formatTime } from './TimePicker';

interface CalendarViewProps {
  tasks: Task[];
  getTasksForDate: (date: Date) => Task[];
  onToggle: (id: string, completeAllFuture?: boolean) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onDeleteSeries?: (seriesId: string) => void;
}

const priorityDotStyles: Record<Priority, string> = {
  high: 'bg-priority-high',
  medium: 'bg-priority-medium',
  low: 'bg-priority-low',
};

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6AM to 11PM

export function CalendarView({
  tasks,
  getTasksForDate,
  onToggle,
  onUpdate,
  onDelete,
  onDeleteSeries,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');

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

  const getTasksGroupedByTimeSlot = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    const groups: Record<TimeSlot, Task[]> = {
      allDay: [],
      morning: [],
      afternoon: [],
      evening: [],
    };

    dayTasks.forEach((task) => {
      if (task.allDay || !task.dueTime) {
        groups.allDay.push(task);
      } else {
        const [hours] = task.dueTime.split(':').map(Number);
        if (hours < 12) groups.morning.push(task);
        else if (hours < 18) groups.afternoon.push(task);
        else groups.evening.push(task);
      }
    });

    return groups;
  };

  const getTasksForHour = (date: Date, hour: number) => {
    return getTasksForDate(date).filter((task) => {
      if (task.allDay || !task.dueTime) return false;
      const [taskHour] = task.dueTime.split(':').map(Number);
      return taskHour === hour;
    });
  };

  const handleDayClick = (date: Date) => {
    if (selectedDate && isSameDay(date, selectedDate)) {
      setViewMode('day');
    } else {
      setSelectedDate(date);
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === 'month' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
          <Button
            variant={viewMode === 'day' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => {
              setViewMode('day');
              if (!selectedDate) setSelectedDate(new Date());
            }}
          >
            Day
          </Button>
          <div className="w-px h-4 bg-border mx-2" />
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
            onClick={() => {
              setCurrentMonth(new Date());
              setSelectedDate(new Date());
            }}
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

      {viewMode === 'month' ? (
        <>
          <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden bg-border shadow-soft">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((weekday) => (
              <div
                key={weekday}
                className="bg-muted py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                {weekday}
              </div>
            ))}

            {days.map((date) => {
              const dayTasks = getTasksForDate(date);
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isSelected = selectedDate && isSameDay(date, selectedDate);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDayClick(date)}
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

                  {dayTasks.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs truncate',
                            task.completed
                              ? 'bg-muted text-muted-foreground line-through'
                              : cn(
                                  task.priority === 'high' && 'bg-priority-high-bg text-priority-high',
                                  task.priority === 'medium' && 'bg-priority-medium-bg text-priority-medium',
                                  task.priority === 'low' && 'bg-priority-low-bg text-priority-low'
                                )
                          )}
                        >
                          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', priorityDotStyles[task.priority])} />
                          {task.dueTime && !task.allDay && (
                            <span className="shrink-0 opacity-70">{formatTime(task.dueTime).split(' ')[0]}</span>
                          )}
                          <span className="truncate">{task.title}</span>
                          {task.recurrence && task.recurrence.type !== 'none' && (
                            <Repeat className="h-2.5 w-2.5 shrink-0 opacity-70" />
                          )}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="text-xs text-muted-foreground pl-1">+{dayTasks.length - 3} more</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-foreground">
                  Tasks for {format(selectedDate, 'EEEE, MMMM d')}
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setViewMode('day')}>
                    <Clock className="h-4 w-4 mr-1" />
                    Day View
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedDate(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {selectedTasks.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center bg-muted/50 rounded-xl">
                  No tasks scheduled for this day
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onToggle={onToggle} onUpdate={onUpdate} onDelete={onDelete} onDeleteSeries={onDeleteSeries} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* Day View */
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setSelectedDate((d) => d ? addDays(d, -1) : addDays(new Date(), -1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-medium">{format(selectedDate || new Date(), 'EEEE, MMMM d')}</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedDate((d) => d ? addDays(d, 1) : addDays(new Date(), 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* All-day tasks */}
          {(() => {
            const grouped = getTasksGroupedByTimeSlot(selectedDate || new Date());
            return grouped.allDay.length > 0 && (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">All Day</h4>
                <div className="space-y-1">
                  {grouped.allDay.map((task) => (
                    <TaskItem key={task.id} task={task} onToggle={onToggle} onUpdate={onUpdate} onDelete={onDelete} onDeleteSeries={onDeleteSeries} compact />
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Hourly timeline */}
          <div className="border rounded-xl overflow-hidden">
            {HOURS.map((hour) => {
              const hourTasks = getTasksForHour(selectedDate || new Date(), hour);
              return (
                <div key={hour} className={cn('flex border-b last:border-b-0 min-h-[60px]', hourTasks.length > 0 && 'bg-accent/20')}>
                  <div className="w-16 shrink-0 p-2 text-xs text-muted-foreground border-r bg-muted/30">
                    {format(setHours(new Date(), hour), 'h a')}
                  </div>
                  <div className="flex-1 p-2 space-y-1">
                    {hourTasks.map((task) => (
                      <TaskItem key={task.id} task={task} onToggle={onToggle} onUpdate={onUpdate} onDelete={onDelete} onDeleteSeries={onDeleteSeries} compact />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
