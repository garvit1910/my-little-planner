import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
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
          <Button className="gap-2 shadow-soft hover:shadow-card transition-shadow">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {initialTask ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-foreground">
              Title
            </label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Date & Time Section */}
          <div className="space-y-4">
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
                        'w-full h-11 justify-start text-left font-normal',
                        !dueDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'MMM d, yyyy') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
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
          </div>

          {/* Priority & Recurrence */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Priority</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {initialTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
