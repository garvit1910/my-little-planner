import { useState, useEffect, useCallback } from 'react';
import { NotificationSettings, DEFAULT_NOTIFICATION_SETTINGS } from '@/types/notification';

const SETTINGS_STORAGE_KEY = 'taskflow-notification-settings';
const PERMISSION_STORAGE_KEY = 'taskflow-notification-permission';

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
  });

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  });

  const [permissionRequested, setPermissionRequested] = useState<boolean>(() => {
    try {
      return localStorage.getItem(PERMISSION_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Check if notifications are supported
  const notificationsSupported = typeof window !== 'undefined' && 'Notification' in window;

  // Request browser notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!notificationsSupported) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      setPermissionRequested(true);
      localStorage.setItem(PERMISSION_STORAGE_KEY, 'true');
      return permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }, [notificationsSupported]);

  // Update a single setting
  const updateSetting = useCallback(<K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Reset to default settings
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_NOTIFICATION_SETTINGS);
  }, []);

  // Check if we're in quiet hours
  const isQuietHours = useCallback((): boolean => {
    if (!settings.quietHoursEnabled) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = settings.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = settings.quietHoursEnd.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }

    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }, [settings.quietHoursEnabled, settings.quietHoursStart, settings.quietHoursEnd]);

  // Check if it's a weekend
  const isWeekend = useCallback((): boolean => {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  }, []);

  // Check if notifications should be sent right now
  const shouldSendNotification = useCallback((): boolean => {
    if (isQuietHours()) return false;
    if (!settings.weekendNotificationsEnabled && isWeekend()) return false;
    return true;
  }, [isQuietHours, isWeekend, settings.weekendNotificationsEnabled]);

  return {
    settings,
    updateSetting,
    resetSettings,
    permissionStatus,
    permissionRequested,
    requestPermission,
    notificationsSupported,
    isQuietHours,
    shouldSendNotification,
  };
}
