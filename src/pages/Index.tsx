import { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { ViewMode } from '@/types/task';
import { useTasks } from '@/hooks/useTasks';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileNav } from '@/components/MobileNav';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { CalendarView } from '@/components/CalendarView';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AnimatedBackground, PageTransition } from '@/components/animations';

const Index = () => {
  const [view, setView] = useState<ViewMode>('list');
  const [fabFormOpen, setFabFormOpen] = useState(false);
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

  const taskCounts = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
  };

  return (
    <div className="flex min-h-screen bg-background relative">
      <AnimatedBackground />
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar
          currentView={view}
          onViewChange={setView}
          taskCounts={taskCounts}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
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
              <ThemeToggle />
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
      </main>

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
    </div>
  );
};

export default Index;