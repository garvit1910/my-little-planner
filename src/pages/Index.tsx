import { useState, useEffect } from 'react';
import { CheckSquare, List, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { ViewMode } from '@/types/task';
import { useTasks } from '@/hooks/useTasks';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { AppLayout } from '@/components/AppLayout';
import { MobileNav } from '@/components/MobileNav';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { CalendarView } from '@/components/CalendarView';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationBell } from '@/components/NotificationBell';
import { NotificationSettings } from '@/components/NotificationSettings';
import { NotificationPermissionBanner } from '@/components/NotificationPermissionBanner';
import { AnimatedBackground, PageTransition } from '@/components/animations';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [view, setView] = useState<ViewMode>('list');
  const [fabFormOpen, setFabFormOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    deleteTaskSeries,
    toggleComplete,
    sortBy,
    setSortBy,
    getTasksForDate,
  } = useTasks();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    snoozeNotification,
  } = useNotifications(tasks);

  const {
    permissionStatus,
    permissionRequested,
    requestPermission,
  } = useNotificationSettings();

  // Listen for task completion from notifications
  useEffect(() => {
    const handleCompleteTask = (e: CustomEvent<{ taskId: string }>) => {
      toggleComplete(e.detail.taskId);
    };

    window.addEventListener('taskflow:completeTask', handleCompleteTask as EventListener);
    return () => {
      window.removeEventListener('taskflow:completeTask', handleCompleteTask as EventListener);
    };
  }, [toggleComplete]);

  return (
    <AppLayout>
      <div className="relative min-h-screen bg-background">
        <AnimatedBackground />
        {/* Mobile Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-40 flex items-center justify-between border-b border-border glass-strong px-4 py-4 md:hidden"
        >
          <div className="flex items-center gap-2">
            <motion.div 
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--gradient-primary)' }}
              whileHover={{ scale: 1.05 }}
            >
              <CheckSquare className="h-4 w-4 text-white" />
            </motion.div>
            <span className="text-lg font-semibold text-gradient">TaskFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onClearAll={clearAll}
              onDelete={deleteNotification}
              onSnooze={snoozeNotification}
              onOpenSettings={() => setSettingsOpen(true)}
            />
            <ThemeToggle />
          </div>
        </motion.header>

        <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-10 pb-24 md:pb-10">
          {/* Desktop Header */}
          <motion.div
            className="hidden md:flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {view === 'list' ? 'All Tasks' : 'Calendar'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {view === 'list'
                  ? 'Manage and organize your tasks'
                  : 'View your tasks on the calendar'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View switcher */}
              <div className="flex gap-2">
                <Button
                  variant={view === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('list')}
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
                <Button
                  variant={view === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('calendar')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
              </div>
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onClearAll={clearAll}
                onDelete={deleteNotification}
                onSnooze={snoozeNotification}
                onOpenSettings={() => setSettingsOpen(true)}
              />
              <TaskForm onSubmit={addTask} />
            </div>
          </motion.div>

          {/* View Content with Page Transitions */}
          <PageTransition keyProp={view}>
            {view === 'list' ? (
              <TaskList
                tasks={tasks}
                onToggle={toggleComplete}
                onUpdate={updateTask}
                onDelete={deleteTask}
                onDeleteSeries={deleteTaskSeries}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            ) : (
              <CalendarView
                tasks={tasks}
                getTasksForDate={getTasksForDate}
                onToggle={toggleComplete}
                onUpdate={updateTask}
                onDelete={deleteTask}
                onDeleteSeries={deleteTaskSeries}
              />
            )}
          </PageTransition>
        </div>

        {/* Mobile Navigation */}
        <MobileNav currentView={view} onViewChange={setView} />

        {/* Floating Action Button for Mobile */}
        <div className="md:hidden">
          <TaskForm
            onSubmit={addTask}
            trigger={
              <FloatingActionButton
                onClick={() => setFabFormOpen(true)}
                isOpen={fabFormOpen}
              />
            }
            onClose={() => setFabFormOpen(false)}
          />
        </div>

        {/* Notification Permission Banner */}
        <NotificationPermissionBanner
          permissionStatus={permissionStatus}
          permissionRequested={permissionRequested}
          onRequestPermission={requestPermission}
        />

        {/* Notification Settings Dialog */}
        <NotificationSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </AppLayout>
  );
};

export default Index;