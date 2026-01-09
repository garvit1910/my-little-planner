import { useState } from 'react';
import { Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { cn } from '@/lib/utils';
import { RecurrencePattern, RecurrenceType } from '@/types/task';

interface RecurrenceSelectorProps {
  value?: RecurrencePattern;
  onChange: (pattern: RecurrencePattern | undefined) => void;
}

const WEEKDAYS = [
  { label: 'S', value: 0, fullLabel: 'Sun' },
  { label: 'M', value: 1, fullLabel: 'Mon' },
  { label: 'T', value: 2, fullLabel: 'Tue' },
  { label: 'W', value: 3, fullLabel: 'Wed' },
  { label: 'T', value: 4, fullLabel: 'Thu' },
  { label: 'F', value: 5, fullLabel: 'Fri' },
  { label: 'S', value: 6, fullLabel: 'Sat' },
];

export function getRecurrenceLabel(pattern?: RecurrencePattern): string {
  if (!pattern || pattern.type === 'none') return 'Does not repeat';
  
  switch (pattern.type) {
    case 'daily':
      return 'Repeats daily';
    case 'weekly':
      if (pattern.weekDays && pattern.weekDays.length > 0) {
        const days = pattern.weekDays
          .sort()
          .map((d) => WEEKDAYS.find((w) => w.value === d)?.fullLabel)
          .join(', ');
        return `Weekly on ${days}`;
      }
      return 'Repeats weekly';
    case 'monthly':
      return 'Repeats monthly';
    case 'custom':
      return `Every ${pattern.interval || 1} day${(pattern.interval || 1) > 1 ? 's' : ''}`;
    default:
      return 'Does not repeat';
  }
}

export function RecurrenceSelector({ value, onChange }: RecurrenceSelectorProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<RecurrenceType>(value?.type || 'none');
  const [interval, setInterval] = useState(value?.interval || 2);
  const [weekDays, setWeekDays] = useState<number[]>(value?.weekDays || []);

  const handleTypeChange = (newType: RecurrenceType) => {
    setType(newType);
    if (newType === 'none') {
      onChange(undefined);
    } else {
      onChange({
        type: newType,
        interval: newType === 'custom' ? interval : undefined,
        weekDays: newType === 'weekly' ? weekDays : undefined,
      });
    }
  };

  const handleWeekDayToggle = (day: number) => {
    const newDays = weekDays.includes(day)
      ? weekDays.filter((d) => d !== day)
      : [...weekDays, day];
    setWeekDays(newDays);
    onChange({
      type: 'weekly',
      weekDays: newDays,
    });
  };

  const handleIntervalChange = (newInterval: number) => {
    setInterval(newInterval);
    onChange({
      type: 'custom',
      interval: newInterval,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full h-11 justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <Repeat className="mr-2 h-4 w-4" />
          {getRecurrenceLabel(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 pointer-events-auto" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase">
              Repeat
            </Label>
            <Select value={type} onValueChange={(v) => handleTypeChange(v as RecurrenceType)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Does not repeat</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'weekly' && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase">
                Repeat on
              </Label>
              <div className="flex gap-1">
                {WEEKDAYS.map((day) => (
                  <Button
                    key={day.value}
                    variant={weekDays.includes(day.value) ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleWeekDayToggle(day.value)}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {type === 'custom' && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase">
                Every X days
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Every</span>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={interval}
                  onChange={(e) => handleIntervalChange(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-9"
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
