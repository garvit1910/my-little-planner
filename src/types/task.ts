export type Priority = 'high' | 'medium' | 'low';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface RecurrencePattern {
  type: RecurrenceType;
  interval?: number; // For custom: every X days
  weekDays?: number[]; // For weekly: 0=Sun, 1=Mon, etc.
  endDate?: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  dueTime?: string; // HH:mm format, undefined means all-day
  allDay: boolean;
  priority: Priority;
  completed: boolean;
  createdAt: Date;
  recurrence?: RecurrencePattern;
  seriesId?: string; // Links recurring task instances
  isRecurringInstance?: boolean;
}

export type ViewMode = 'list' | 'calendar' | 'day';

export type SortBy = 'dueDate' | 'priority' | 'createdAt';

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'allDay';

export const TIME_SLOT_RANGES: Record<TimeSlot, { start: number; end: number; label: string }> = {
  allDay: { start: 0, end: 24, label: 'All Day' },
  morning: { start: 6, end: 12, label: 'Morning (6AM - 12PM)' },
  afternoon: { start: 12, end: 18, label: 'Afternoon (12PM - 6PM)' },
  evening: { start: 18, end: 24, label: 'Evening (6PM - 12AM)' },
};
