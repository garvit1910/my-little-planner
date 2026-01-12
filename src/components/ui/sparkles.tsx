import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SparklesProps {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
  speed?: number;
}

export const SparklesCore: React.FC<SparklesProps> = ({
  id = "sparkles",
  className,
  background = "transparent",
  minSize = 0.4,
  maxSize = 1,
  particleDensity = 1200,
  particleColor = "#FFFFFF",
  speed = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      fadeSpeed: number;
    }

    const particles: Particle[] = [];

    const createParticle = (): Particle => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * (maxSize - minSize) + minSize,
        speedX: (Math.random() - 0.5) * speed * 0.5,
        speedY: (Math.random() - 0.5) * speed * 0.5,
        opacity: Math.random(),
        fadeSpeed: Math.random() * 0.01 + 0.005,
      };
    };

    // Initialize particles
    for (let i = 0; i < particleDensity; i++) {
      particles.push(createParticle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Update opacity for twinkling effect
        particle.opacity += particle.fadeSpeed;
        if (particle.opacity >= 1 || particle.opacity <= 0) {
          particle.fadeSpeed *= -1;
        }

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${particleColor}${Math.floor(particle.opacity * 255)
          .toString(16)
          .padStart(2, "0")}`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [
    background,
    minSize,
    maxSize,
    particleDensity,
    particleColor,
    speed,
  ]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={cn("absolute inset-0", className)}
      style={{ background }}
    />
  );
};
