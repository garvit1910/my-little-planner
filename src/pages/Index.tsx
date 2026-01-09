import { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import { ViewMode } from '@/types/task';
import { useTasks } from '@/hooks/useTasks';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileNav } from '@/components/MobileNav';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { CalendarView } from '@/components/CalendarView';

const Index = () => {
  const [view, setView] = useState<ViewMode>('list');
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
    <div className="flex min-h-screen bg-background">
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
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-4 py-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <CheckSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">TaskFlow</span>
          </div>
          <TaskForm onSubmit={addTask} />
        </header>

        <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-10 pb-24 md:pb-10">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {view === 'list' ? 'All Tasks' : 'Calendar'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {view === 'list'
                  ? 'Manage and organize your tasks'
                  : 'View your tasks on the calendar'}
              </p>
            </div>
            <TaskForm onSubmit={addTask} />
          </div>

          {/* View Content */}
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
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav currentView={view} onViewChange={setView} />
    </div>
  );
};

export default Index;
