import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Sparkles, ListTodo } from 'lucide-react';

interface EmptyStateProps {
  type: 'tasks' | 'calendar' | 'filtered';
  title?: string;
  description?: string;
}

export function EmptyState({ type, title, description }: EmptyStateProps) {
  const configs = {
    tasks: {
      icon: ListTodo,
      title: 'No tasks yet',
      description: 'Create your first task to start organizing your day',
      gradient: 'from-primary/20 to-purple-500/20',
    },
    calendar: {
      icon: Calendar,
      title: 'No tasks scheduled',
      description: 'Your calendar is clear! Add some tasks to get started',
      gradient: 'from-green-500/20 to-teal-500/20',
    },
    filtered: {
      icon: Sparkles,
      title: 'No matching tasks',
      description: 'Try adjusting your filters to see more tasks',
      gradient: 'from-amber-500/20 to-orange-500/20',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Animated illustration */}
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Background glow */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.gradient} blur-2xl`}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Icon container */}
        <motion.div
          className="relative h-24 w-24 rounded-2xl bg-card border shadow-card flex items-center justify-center"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon className="h-12 w-12 text-muted-foreground" />
          
          {/* Decorative elements */}
          <motion.div
            className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-primary"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
          <motion.div
            className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-priority-medium"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </motion.div>

        {/* Floating checkmarks */}
        <motion.div
          className="absolute -top-4 -left-4"
          animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <CheckCircle2 className="h-6 w-6 text-priority-low/40" />
        </motion.div>
        <motion.div
          className="absolute -bottom-4 -right-4"
          animate={{ y: [0, -8, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <CheckCircle2 className="h-5 w-5 text-primary/40" />
        </motion.div>
      </motion.div>

      {/* Text content */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold text-foreground mb-2"
      >
        {title || config.title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground max-w-sm"
      >
        {description || config.description}
      </motion.p>

      {/* Encouragement */}
      {type === 'tasks' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Click the + button to add your first task</span>
        </motion.div>
      )}
    </motion.div>
  );
}