export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  completed: boolean;
  createdAt: Date;
}

export type ViewMode = 'list' | 'calendar';

export type SortBy = 'dueDate' | 'priority' | 'createdAt';
