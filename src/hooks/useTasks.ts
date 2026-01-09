import { useState, useCallback, useEffect } from 'react';
import { Task, Priority, SortBy, RecurrencePattern } from '@/types/task';
import { addDays, addMonths, addWeeks, setHours, setMinutes, differenceInMinutes, isBefore } from 'date-fns';

const STORAGE_KEY = 'task-planner-tasks';

const generateId = () => Math.random().toString(36).substring(2, 15);

const getInitialTasks = (): Task[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((task: Task) => ({
        ...task,
        dueDate: new Date(task.dueDate),
        createdAt: new Date(task.createdAt),
      }));
    }
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
  }
  return [];
};

function calculateNextOccurrence(dueDate: Date, recurrence: RecurrencePattern): Date {
  const nextDate = new Date(dueDate);
  
  switch (recurrence.type) {
    case 'daily':
      return addDays(nextDate, 1);
    case 'weekly':
      if (recurrence.weekDays && recurrence.weekDays.length > 0) {
        // Find next weekday in the pattern
        let tempDate = addDays(nextDate, 1);
        for (let i = 0; i < 7; i++) {
          const dayOfWeek = tempDate.getDay();
          if (recurrence.weekDays.includes(dayOfWeek)) {
            return tempDate;
          }
          tempDate = addDays(tempDate, 1);
        }
        return addWeeks(nextDate, 1);
      }
      return addWeeks(nextDate, 1);
    case 'monthly':
      return addMonths(nextDate, 1);
    case 'custom':
      return addDays(nextDate, recurrence.interval || 1);
    default:
      return nextDate;
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => getInitialTasks());
  const [sortBy, setSortBy] = useState<SortBy>('dueDate');
  const [notifiedTaskIds, setNotifiedTaskIds] = useState<Set<string>>(new Set());

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Check for upcoming tasks and notify
  useEffect(() => {
    const checkUpcomingTasks = () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
      }

      const now = new Date();
      tasks.forEach((task) => {
        if (task.completed || task.allDay || !task.dueTime || notifiedTaskIds.has(task.id)) {
          return;
        }

        const [hours, minutes] = task.dueTime.split(':').map(Number);
        const taskDateTime = setMinutes(setHours(new Date(task.dueDate), hours), minutes);
        const minutesUntil = differenceInMinutes(taskDateTime, now);

        if (minutesUntil > 0 && minutesUntil <= 60 && !isBefore(taskDateTime, now)) {
          new Notification(`Task Due Soon: ${task.title}`, {
            body: `Due in ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}`,
            icon: '/favicon.ico',
          });
          setNotifiedTaskIds((prev) => new Set([...prev, task.id]));
        }
      });
    };

    checkUpcomingTasks();
    const interval = setInterval(checkUpcomingTasks, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks, notifiedTaskIds]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const seriesId = task.recurrence && task.recurrence.type !== 'none' 
      ? generateId() 
      : undefined;
    
    const newTask: Task = {
      ...task,
      id: generateId(),
      completed: false,
      createdAt: new Date(),
      seriesId,
      isRecurringInstance: false,
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const deleteTaskSeries = useCallback((seriesId: string) => {
    setTasks((prev) => prev.filter((task) => task.seriesId !== seriesId));
  }, []);

  const toggleComplete = useCallback((id: string, completeAllFuture?: boolean) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (!task) return prev;

      const newCompleted = !task.completed;
      let updatedTasks = prev.map((t) =>
        t.id === id ? { ...t, completed: newCompleted } : t
      );

      // If completing a recurring task, create next occurrence
      if (newCompleted && task.recurrence && task.recurrence.type !== 'none' && !completeAllFuture) {
        const nextDueDate = calculateNextOccurrence(task.dueDate, task.recurrence);
        const nextTask: Task = {
          ...task,
          id: generateId(),
          dueDate: nextDueDate,
          completed: false,
          createdAt: new Date(),
          isRecurringInstance: true,
        };
        updatedTasks = [...updatedTasks, nextTask];
      }

      // If completing all future occurrences
      if (newCompleted && completeAllFuture && task.seriesId) {
        updatedTasks = updatedTasks.map((t) =>
          t.seriesId === task.seriesId && !t.completed
            ? { ...t, completed: true, recurrence: undefined }
            : t
        );
      }

      return updatedTasks;
    });
  }, []);

  const priorityOrder: Record<Priority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  const getTaskDateTime = (task: Task): Date => {
    if (task.allDay || !task.dueTime) {
      return new Date(task.dueDate);
    }
    const [hours, minutes] = task.dueTime.split(':').map(Number);
    return setMinutes(setHours(new Date(task.dueDate), hours), minutes);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return getTaskDateTime(a).getTime() - getTaskDateTime(b).getTime();
    }
    if (sortBy === 'priority') {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getTasksForDate = useCallback(
    (date: Date) => {
      return tasks.filter((task) => {
        const taskDate = new Date(task.dueDate);
        return (
          taskDate.getFullYear() === date.getFullYear() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getDate() === date.getDate()
        );
      });
    },
    [tasks]
  );

  const getTasksForTimeSlot = useCallback(
    (date: Date, startHour: number, endHour: number) => {
      return getTasksForDate(date).filter((task) => {
        if (task.allDay || !task.dueTime) return false;
        const [hours] = task.dueTime.split(':').map(Number);
        return hours >= startHour && hours < endHour;
      });
    },
    [getTasksForDate]
  );

  const getAllDayTasksForDate = useCallback(
    (date: Date) => {
      return getTasksForDate(date).filter((task) => task.allDay || !task.dueTime);
    },
    [getTasksForDate]
  );

  return {
    tasks: sortedTasks,
    addTask,
    updateTask,
    deleteTask,
    deleteTaskSeries,
    toggleComplete,
    sortBy,
    setSortBy,
    getTasksForDate,
    getTasksForTimeSlot,
    getAllDayTasksForDate,
  };
}
