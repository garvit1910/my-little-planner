import { Bell, BellOff, Volume2, VolumeX, Clock, Calendar, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { NotificationTiming } from '@/types/notification';
import { cn } from '@/lib/utils';

interface NotificationSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const timingOptions: { value: NotificationTiming; label: string }[] = [
  { value: '5min', label: '5 min before' },
  { value: '15min', label: '15 min before' },
  { value: '30min', label: '30 min before' },
  { value: '1hour', label: '1 hour before' },
];

export function NotificationSettings({ open, onOpenChange }: NotificationSettingsProps) {
  const {
    settings,
    updateSetting,
    permissionStatus,
    requestPermission,
    notificationsSupported,
  } = useNotificationSettings();

  const handleTimingToggle = (timing: NotificationTiming) => {
    const current = settings.timingOptions;
    const newTimings = current.includes(timing)
      ? current.filter(t => t !== timing)
      : [...current, timing];
    updateSetting('timingOptions', newTimings);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </DialogTitle>
          <DialogDescription>
            Customize how and when you receive task reminders
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Browser Notifications Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Browser Notifications
            </h4>

            {!notificationsSupported ? (
              <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
                <BellOff className="h-4 w-4 inline mr-2" />
                Your browser doesn't support notifications
              </div>
            ) : permissionStatus === 'denied' ? (
              <div className="p-3 rounded-lg bg-destructive/10 text-sm text-destructive">
                <BellOff className="h-4 w-4 inline mr-2" />
                Notifications are blocked. Enable them in your browser settings.
              </div>
            ) : (
              <>
                {permissionStatus === 'default' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-primary/10 border border-primary/20"
                  >
                    <p className="text-sm mb-3">
                      Enable browser notifications to get reminders for upcoming tasks,
                      even when this tab isn't active.
                    </p>
                    <Button onClick={requestPermission} size="sm">
                      <Bell className="h-4 w-4 mr-2" />
                      Enable Notifications
                    </Button>
                  </motion.div>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="browser-notifs" className="flex items-center gap-2">
                    Browser notifications
                  </Label>
                  <Switch
                    id="browser-notifs"
                    checked={settings.browserNotificationsEnabled}
                    onCheckedChange={(checked) => updateSetting('browserNotificationsEnabled', checked)}
                    disabled={permissionStatus !== 'granted'}
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="in-app-notifs" className="flex items-center gap-2">
                In-app notifications
              </Label>
              <Switch
                id="in-app-notifs"
                checked={settings.inAppNotificationsEnabled}
                onCheckedChange={(checked) => updateSetting('inAppNotificationsEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sound" className="flex items-center gap-2">
                {settings.soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
                Notification sound
              </Label>
              <Switch
                id="sound"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Timing Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Reminder Timing
            </h4>
            <div className="flex flex-wrap gap-2">
              {timingOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={settings.timingOptions.includes(option.value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimingToggle(option.value)}
                  className={cn(
                    'transition-all',
                    settings.timingOptions.includes(option.value) && 'shadow-sm'
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Quiet Hours */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Quiet Hours
              </h4>
              <Switch
                checked={settings.quietHoursEnabled}
                onCheckedChange={(checked) => updateSetting('quietHoursEnabled', checked)}
              />
            </div>
            
            {settings.quietHoursEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2"
              >
                <Input
                  type="time"
                  value={settings.quietHoursStart}
                  onChange={(e) => updateSetting('quietHoursStart', e.target.value)}
                  className="w-28"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <Input
                  type="time"
                  value={settings.quietHoursEnd}
                  onChange={(e) => updateSetting('quietHoursEnd', e.target.value)}
                  className="w-28"
                />
              </motion.div>
            )}
          </div>

          <Separator />

          {/* Weekend Notifications */}
          <div className="flex items-center justify-between">
            <Label htmlFor="weekend" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekend notifications
            </Label>
            <Switch
              id="weekend"
              checked={settings.weekendNotificationsEnabled}
              onCheckedChange={(checked) => updateSetting('weekendNotificationsEnabled', checked)}
            />
          </div>

          {/* Daily Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="daily-summary" className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                Daily summary
              </Label>
              <Switch
                id="daily-summary"
                checked={settings.dailySummaryEnabled}
                onCheckedChange={(checked) => updateSetting('dailySummaryEnabled', checked)}
              />
            </div>
            
            {settings.dailySummaryEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2"
              >
                <span className="text-sm text-muted-foreground">Send at</span>
                <Input
                  type="time"
                  value={settings.dailySummaryTime}
                  onChange={(e) => updateSetting('dailySummaryTime', e.target.value)}
                  className="w-28"
                />
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
