import { useState, useEffect, useCallback, useRef } from 'react';
import { AppNotification, NotificationType, TIMING_MINUTES } from '@/types/notification';
import { Task } from '@/types/task';
import { useNotificationSettings } from './useNotificationSettings';
import { 
  differenceInMinutes, 
  setHours, 
  setMinutes, 
  isBefore, 
  isToday,
  format 
} from 'date-fns';

const NOTIFICATIONS_STORAGE_KEY = 'taskflow-notifications';
const SENT_NOTIFICATIONS_KEY = 'taskflow-sent-notifications';
const SNOOZE_STORAGE_KEY = 'taskflow-snoozed-notifications';

const generateId = () => Math.random().toString(36).substring(2, 15);

// Notification sound
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('Could not play notification sound');
  }
};

interface SentNotification {
  taskId: string;
  timing: string; // e.g., '15min', '5min', 'due', 'overdue'
  sentAt: number;
}

interface SnoozedNotification {
  taskId: string;
  snoozeUntil: number;
}

export function useNotifications(tasks: Task[]) {
  const { 
    settings, 
    permissionStatus, 
    shouldSendNotification,
    notificationsSupported 
  } = useNotificationSettings();

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((n: AppNotification) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        }));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
    return [];
  });

  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>(() => {
    try {
      const stored = localStorage.getItem(SENT_NOTIFICATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load sent notifications:', error);
    }
    return [];
  });

  const [snoozedNotifications, setSnoozedNotifications] = useState<SnoozedNotification[]>(() => {
    try {
      const stored = localStorage.getItem(SNOOZE_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load snoozed notifications:', error);
    }
    return [];
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Persist notifications
  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(SENT_NOTIFICATIONS_KEY, JSON.stringify(sentNotifications));
  }, [sentNotifications]);

  useEffect(() => {
    localStorage.setItem(SNOOZE_STORAGE_KEY, JSON.stringify(snoozedNotifications));
  }, [snoozedNotifications]);

  // Unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Add in-app notification
  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    taskId?: string,
    priority?: 'high' | 'medium' | 'low',
    actionLabel?: string
  ) => {
    if (!settings.inAppNotificationsEnabled) return;

    const notification: AppNotification = {
      id: generateId(),
      type,
      title,
      message,
      taskId,
      priority,
      createdAt: new Date(),
      read: false,
      actionLabel,
    };

    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
  }, [settings.inAppNotificationsEnabled]);

  // Send browser notification
  const sendBrowserNotification = useCallback((
    title: string,
    body: string,
    taskId?: string,
    priority?: 'high' | 'medium' | 'low'
  ) => {
    if (!settings.browserNotificationsEnabled) return;
    if (!notificationsSupported) return;
    if (permissionStatus !== 'granted') return;
    if (!shouldSendNotification()) return;

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: taskId || generateId(),
        requireInteraction: priority === 'high',
      });

      notification.onclick = () => {
        window.focus();
        if (taskId) {
          // Could navigate to task - for now just focus the window
          window.dispatchEvent(new CustomEvent('taskflow:focusTask', { detail: { taskId } }));
        }
        notification.close();
      };

      if (settings.soundEnabled) {
        playNotificationSound();
      }
    } catch (error) {
      console.error('Failed to send browser notification:', error);
    }
  }, [
    settings.browserNotificationsEnabled, 
    settings.soundEnabled, 
    notificationsSupported, 
    permissionStatus, 
    shouldSendNotification
  ]);

  // Check if notification was already sent
  const wasNotificationSent = useCallback((taskId: string, timing: string): boolean => {
    const today = new Date().toDateString();
    return sentNotifications.some(
      n => n.taskId === taskId && 
           n.timing === timing && 
           new Date(n.sentAt).toDateString() === today
    );
  }, [sentNotifications]);

  // Check if task is snoozed
  const isTaskSnoozed = useCallback((taskId: string): boolean => {
    const now = Date.now();
    return snoozedNotifications.some(
      s => s.taskId === taskId && s.snoozeUntil > now
    );
  }, [snoozedNotifications]);

  // Mark notification as sent
  const markNotificationSent = useCallback((taskId: string, timing: string) => {
    setSentNotifications(prev => [
      ...prev.filter(n => !(n.taskId === taskId && n.timing === timing)),
      { taskId, timing, sentAt: Date.now() }
    ]);
  }, []);

  // Snooze a task notification
  const snoozeNotification = useCallback((taskId: string, minutes: number) => {
    const snoozeUntil = Date.now() + minutes * 60 * 1000;
    setSnoozedNotifications(prev => [
      ...prev.filter(s => s.taskId !== taskId),
      { taskId, snoozeUntil }
    ]);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Delete a notification
  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Check for upcoming tasks
  const checkUpcomingTasks = useCallback(() => {
    const now = new Date();

    tasks.forEach(task => {
      if (task.completed || task.allDay || !task.dueTime) return;
      if (isTaskSnoozed(task.id)) return;

      const [hours, minutes] = task.dueTime.split(':').map(Number);
      const taskDateTime = setMinutes(setHours(new Date(task.dueDate), hours), minutes);
      const minutesUntil = differenceInMinutes(taskDateTime, now);

      // Check for overdue
      if (isBefore(taskDateTime, now) && minutesUntil >= -60) {
        if (!wasNotificationSent(task.id, 'overdue')) {
          sendBrowserNotification(
            `⚠️ Overdue: ${task.title}`,
            task.description || `Was due at ${task.dueTime}`,
            task.id,
            'high'
          );
          addNotification(
            'task-overdue',
            'Task Overdue',
            `${task.title} was due at ${task.dueTime}`,
            task.id,
            task.priority,
            'Mark as Done'
          );
          markNotificationSent(task.id, 'overdue');
        }
        return;
      }

      // Check for exact time
      if (minutesUntil >= 0 && minutesUntil <= 1) {
        if (!wasNotificationSent(task.id, 'due')) {
          sendBrowserNotification(
            `🔔 Due Now: ${task.title}`,
            task.description || 'This task is due now!',
            task.id,
            task.priority
          );
          addNotification(
            'task-due-now',
            'Task Due Now',
            task.title,
            task.id,
            task.priority,
            'Mark as Done'
          );
          markNotificationSent(task.id, 'due');
        }
      }

      // Check timing options
      settings.timingOptions.forEach(timing => {
        const timingMinutes = timing === 'custom' 
          ? (settings.customTiming || 0) 
          : TIMING_MINUTES[timing];
        
        if (timingMinutes > 0 && minutesUntil > 0 && minutesUntil <= timingMinutes) {
          if (!wasNotificationSent(task.id, timing)) {
            const timeLabel = timing === 'custom' 
              ? `${timingMinutes} minutes` 
              : timing.replace('min', ' minutes').replace('hour', ' hour');
            
            sendBrowserNotification(
              `⏰ Coming Up: ${task.title}`,
              `Due in ${timeLabel}`,
              task.id,
              task.priority
            );
            addNotification(
              'task-due-soon',
              'Task Due Soon',
              `${task.title} - Due in ${timeLabel}`,
              task.id,
              task.priority,
              'Snooze'
            );
            markNotificationSent(task.id, timing);
          }
        }
      });
    });
  }, [
    tasks, 
    settings.timingOptions, 
    settings.customTiming,
    isTaskSnoozed, 
    wasNotificationSent, 
    sendBrowserNotification, 
    addNotification, 
    markNotificationSent
  ]);

  // Daily summary
  const sendDailySummary = useCallback(() => {
    if (!settings.dailySummaryEnabled) return;

    const todayTasks = tasks.filter(t => !t.completed && isToday(new Date(t.dueDate)));
    if (todayTasks.length === 0) return;

    const now = new Date();
    const [summaryHour, summaryMinute] = settings.dailySummaryTime.split(':').map(Number);
    
    if (now.getHours() === summaryHour && now.getMinutes() === summaryMinute) {
      const summaryKey = `daily-summary-${format(now, 'yyyy-MM-dd')}`;
      if (!wasNotificationSent('daily', summaryKey)) {
        sendBrowserNotification(
          '📋 Daily Summary',
          `You have ${todayTasks.length} task${todayTasks.length !== 1 ? 's' : ''} due today`,
          undefined,
          'low'
        );
        addNotification(
          'daily-summary',
          'Daily Summary',
          `You have ${todayTasks.length} task${todayTasks.length !== 1 ? 's' : ''} due today`,
          undefined,
          'low'
        );
        markNotificationSent('daily', summaryKey);
      }
    }
  }, [
    tasks, 
    settings.dailySummaryEnabled, 
    settings.dailySummaryTime,
    wasNotificationSent, 
    sendBrowserNotification, 
    addNotification, 
    markNotificationSent
  ]);

  // Set up interval for checking tasks
  useEffect(() => {
    const check = () => {
      checkUpcomingTasks();
      sendDailySummary();
    };

    check(); // Initial check
    intervalRef.current = setInterval(check, 60000); // Every minute

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkUpcomingTasks, sendDailySummary]);

  // Clean up old sent notifications (older than 24 hours)
  useEffect(() => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    setSentNotifications(prev => prev.filter(n => n.sentAt > oneDayAgo));
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    snoozeNotification,
    sendBrowserNotification,
  };
}
