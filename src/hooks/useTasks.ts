import { useState, useCallback } from 'react';
import { Task, Priority, SortBy } from '@/types/task';

const generateId = () => Math.random().toString(36).substring(2, 15);

const initialTasks: Task[] = [
  {
    id: generateId(),
    title: 'Review project proposal',
    description: 'Go through the Q1 project proposal and provide feedback',
    dueDate: new Date(Date.now() + 86400000),
    priority: 'high',
    completed: false,
    createdAt: new Date(),
  },
  {
    id: generateId(),
    title: 'Team standup meeting',
    description: 'Daily sync with the development team',
    dueDate: new Date(),
    priority: 'medium',
    completed: false,
    createdAt: new Date(),
  },
  {
    id: generateId(),
    title: 'Update documentation',
    description: 'Add new API endpoints to the docs',
    dueDate: new Date(Date.now() + 172800000),
    priority: 'low',
    completed: true,
    createdAt: new Date(),
  },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [sortBy, setSortBy] = useState<SortBy>('dueDate');

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      completed: false,
      createdAt: new Date(),
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

  const toggleComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const priorityOrder: Record<Priority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
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

  return {
    tasks: sortedTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    sortBy,
    setSortBy,
    getTasksForDate,
  };
}
