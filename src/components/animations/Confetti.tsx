import { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function useConfetti() {
  const fire = useCallback((options?: confetti.Options) => {
    const defaults: confetti.Options = {
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4F46E5', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'],
      ticks: 150,
      gravity: 1.2,
      scalar: 1.1,
      shapes: ['circle', 'square'],
    };

    confetti({
      ...defaults,
      ...options,
    });
  }, []);

  const burst = useCallback((x: number, y: number) => {
    const rect = { x: x / window.innerWidth, y: y / window.innerHeight };
    
    confetti({
      particleCount: 50,
      spread: 60,
      origin: rect,
      colors: ['#4F46E5', '#8B5CF6', '#10B981'],
      ticks: 100,
      gravity: 1.5,
      scalar: 0.8,
    });
  }, []);

  const celebrateBig = useCallback(() => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#4F46E5', '#8B5CF6', '#EC4899'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#10B981', '#F59E0B', '#4F46E5'],
      });
    }, 250);
  }, []);

  return { fire, burst, celebrateBig };
}

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const { fire } = useConfetti();

  useEffect(() => {
    if (trigger) {
      fire();
      onComplete?.();
    }
  }, [trigger, fire, onComplete]);

  return null;
}