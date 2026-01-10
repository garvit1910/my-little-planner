import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Priority, Task, RecurrencePattern } from '@/types/task';
import { TimePicker } from './TimePicker';
import { RecurrenceSelector } from './RecurrenceSelector';
import { toast } from 'sonner';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  initialTask?: Task;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

export function TaskForm({ onSubmit, initialTask, trigger, onClose }: TaskFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialTask?.dueDate ? new Date(initialTask.dueDate) : new Date()
  );
  const [dueTime, setDueTime] = useState<string | undefined>(initialTask?.dueTime);
  const [allDay, setAllDay] = useState(initialTask?.allDay ?? true);
  const [priority, setPriority] = useState<Priority>(initialTask?.priority || 'medium');
  const [recurrence, setRecurrence] = useState<RecurrencePattern | undefined>(
    initialTask?.recurrence
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      dueTime: allDay ? undefined : dueTime,
      allDay,
      priority,
      recurrence,
      seriesId: initialTask?.seriesId,
      isRecurringInstance: initialTask?.isRecurringInstance,
    });

    // Show success toast
    toast.success(initialTask ? 'Task updated!' : 'Task created!', {
      description: title.trim(),
      duration: 3000,
    });

    if (!initialTask) {
      setTitle('');
      setDescription('');
      setDueDate(new Date());
      setDueTime(undefined);
      setAllDay(true);
      setPriority('medium');
      setRecurrence(undefined);
    }
    setOpen(false);
    onClose?.();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      onClose?.();
    }
  };

  const handleAllDayToggle = (checked: boolean) => {
    setAllDay(checked);
    if (checked) {
      setDueTime(undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button className="gap-2 shadow-soft hover:shadow-card transition-all bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </motion.div>
        )}
      </DialogTrigger>
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto glass-strong border shadow-elevated">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  {initialTask ? 'Edit Task' : 'Create New Task'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label htmlFor="title" className="text-sm font-medium text-foreground">
                    Title
                  </label>
                  <Input
                    id="title"
                    placeholder="What needs to be done?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-11 focus:ring-2 focus:ring-primary/20 transition-shadow"
                    autoFocus
                  />
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label htmlFor="description" className="text-sm font-medium text-foreground">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Add more details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[80px] resize-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                  />
                </motion.div>

                {/* Date & Time Section */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor="all-day" className="text-sm font-medium text-foreground">
                      All Day Task
                    </Label>
                    <Switch
                      id="all-day"
                      checked={allDay}
                      onCheckedChange={handleAllDayToggle}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Due Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full h-11 justify-start text-left font-normal hover:shadow-soft transition-shadow',
                              !dueDate && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dueDate ? format(dueDate, 'MMM d, yyyy') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 shadow-elevated" align="start">
                          <Calendar
                            mode="single"
                            selected={dueDate}
                            onSelect={setDueDate}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Time {allDay && <span className="text-muted-foreground">(disabled)</span>}
                      </label>
                      <TimePicker
                        value={dueTime}
                        onChange={setDueTime}
                        disabled={allDay}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Priority & Recurrence */}
                <motion.div 
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Priority</label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                      <SelectTrigger className="h-11 hover:shadow-soft transition-shadow">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="shadow-elevated">
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-priority-high" />
                            High
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-priority-medium" />
                            Medium
                          </div>
                        </SelectItem>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-priority-low" />
                            Low
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Repeat</label>
                    <RecurrenceSelector
                      value={recurrence}
                      onChange={setRecurrence}
                    />
                  </div>
                </motion.div>

                <motion.div 
                  className="flex justify-end gap-3 pt-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleOpenChange(false)}
                    className="hover:bg-muted"
                  >
                    Cancel
                  </Button>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      type="submit" 
                      disabled={!title.trim()}
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-soft hover:shadow-card transition-all"
                    >
                      {initialTask ? 'Save Changes' : 'Create Task'}
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}