import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface NotificationPermissionBannerProps {
  onRequestPermission: () => Promise<NotificationPermission>;
  permissionStatus: NotificationPermission;
  permissionRequested: boolean;
}

export function NotificationPermissionBanner({
  onRequestPermission,
  permissionStatus,
  permissionRequested,
}: NotificationPermissionBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Show banner only if permission hasn't been requested yet
    // and notifications are supported
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      permissionStatus === 'default' &&
      !permissionRequested
    ) {
      // Delay showing the banner for a better UX
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [permissionStatus, permissionRequested]);

  const handleEnable = async () => {
    await onRequestPermission();
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
        >
          <div className="bg-card border border-border rounded-xl shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">Stay on top of your tasks</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Enable notifications to get reminders before tasks are due, 
                  even when you're not looking at TaskFlow.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" onClick={handleEnable}>
                    <Bell className="h-4 w-4 mr-1" />
                    Enable
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDismiss}>
                    Not now
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
