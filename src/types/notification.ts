export type NotificationType = 
  | 'task-due-soon' 
  | 'task-due-now' 
  | 'task-overdue' 
  | 'task-completed' 
  | 'streak' 
  | 'recurring-reminder'
  | 'daily-summary'
  | 'info';

export type NotificationTiming = '5min' | '15min' | '30min' | '1hour' | 'custom';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  taskId?: string;
  priority?: 'high' | 'medium' | 'low';
  createdAt: Date;
  read: boolean;
  actionLabel?: string;
}

export interface NotificationSettings {
  browserNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
  soundEnabled: boolean;
  timingOptions: NotificationTiming[];
  customTiming?: number; // minutes
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm format
  quietHoursEnd: string;
  weekendNotificationsEnabled: boolean;
  dailySummaryEnabled: boolean;
  dailySummaryTime: string; // HH:mm format
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  browserNotificationsEnabled: true,
  inAppNotificationsEnabled: true,
  soundEnabled: false,
  timingOptions: ['15min', '5min'],
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  weekendNotificationsEnabled: true,
  dailySummaryEnabled: false,
  dailySummaryTime: '09:00',
};

// Notification timing in minutes
export const TIMING_MINUTES: Record<NotificationTiming, number> = {
  '5min': 5,
  '15min': 15,
  '30min': 30,
  '1hour': 60,
  'custom': 0,
};
