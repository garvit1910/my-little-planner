import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value?: string;
  onChange: (time: string | undefined) => void;
  disabled?: boolean;
}

const QUICK_TIMES = [
  { label: '9:00 AM', value: '09:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '3:00 PM', value: '15:00' },
  { label: '6:00 PM', value: '18:00' },
  { label: '9:00 PM', value: '21:00' },
];

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function TimePicker({ value, onChange, disabled }: TimePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full h-11 justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            disabled && 'opacity-50'
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? formatTime(value) : 'Set time'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 pointer-events-auto" align="start">
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">
              Custom Time
            </label>
            <Input
              type="time"
              value={value || ''}
              onChange={(e) => {
                onChange(e.target.value || undefined);
              }}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">
              Quick Select
            </label>
            <div className="grid grid-cols-2 gap-1">
              {QUICK_TIMES.map((time) => (
                <Button
                  key={time.value}
                  variant={value === time.value ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    onChange(time.value);
                    setOpen(false);
                  }}
                >
                  {time.label}
                </Button>
              ))}
            </div>
          </div>
          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
            >
              Clear time
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
