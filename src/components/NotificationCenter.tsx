import { Bell, Check, Clock, Trash2, Settings, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AppNotification } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onDelete: (id: string) => void;
  onSnooze: (taskId: string, minutes: number) => void;
  onOpenSettings: () => void;
}

const priorityColors = {
  high: 'border-l-priority-high',
  medium: 'border-l-priority-medium',
  low: 'border-l-priority-low',
};

const typeIcons = {
  'task-due-soon': '⏰',
  'task-due-now': '🔔',
  'task-overdue': '⚠️',
  'task-completed': '✅',
  'streak': '🔥',
  'recurring-reminder': '🔄',
  'daily-summary': '📋',
  'info': 'ℹ️',
};

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onDelete,
  onSnooze,
  onOpenSettings,
}: NotificationCenterProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="h-8 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            className="h-8 w-8"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notification List */}
      <ScrollArea className="max-h-96">
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center text-muted-foreground"
            >
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </motion.div>
          ) : (
            notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'p-3 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors border-l-4',
                  !notification.read && 'bg-primary/5',
                  notification.priority ? priorityColors[notification.priority] : 'border-l-transparent'
                )}
                onClick={() => onMarkAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">
                    {typeIcons[notification.type] || '📌'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        'text-sm',
                        !notification.read && 'font-semibold'
                      )}>
                        {notification.title}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(notification.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      {notification.taskId && notification.actionLabel === 'Snooze' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs px-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Snooze
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => onSnooze(notification.taskId!, 10)}>
                              10 minutes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSnooze(notification.taskId!, 30)}>
                              30 minutes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSnooze(notification.taskId!, 60)}>
                              1 hour
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      {notification.actionLabel === 'Mark as Done' && notification.taskId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.dispatchEvent(
                              new CustomEvent('taskflow:completeTask', { 
                                detail: { taskId: notification.taskId } 
                              })
                            );
                            onDelete(notification.id);
                          }}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Done
                        </Button>
                      )}
                    </div>
                  </div>
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="w-full text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
