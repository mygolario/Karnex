"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: "square" | "circle" | "triangle";
}

const COLORS = [
  "#6366f1", // Primary (indigo)
  "#10b981", // Secondary (emerald)  
  "#f59e0b", // Accent (amber)
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
];

interface ConfettiCelebrationProps {
  isActive: boolean;
  duration?: number;
  onComplete?: () => void;
}

export function ConfettiCelebration({ isActive, duration = 3000, onComplete }: ConfettiCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  const createParticle = useCallback((x: number, y: number): Particle => {
    const shapes: ("square" | "circle" | "triangle")[] = ["square", "circle", "triangle"];
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 15,
      vy: Math.random() * -15 - 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    };
  }, []);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate((particle.rotation * Math.PI) / 180);
    ctx.fillStyle = particle.color;

    switch (particle.shape) {
      case "square":
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        break;
      case "circle":
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "triangle":
        ctx.beginPath();
        ctx.moveTo(0, -particle.size / 2);
        ctx.lineTo(-particle.size / 2, particle.size / 2);
        ctx.lineTo(particle.size / 2, particle.size / 2);
        ctx.closePath();
        ctx.fill();
        break;
    }

    ctx.restore();
  }, []);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create initial particles
    particlesRef.current = [];
    const particleCount = 150;
    
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(
        createParticle(
          canvas.width / 2 + (Math.random() - 0.5) * 200,
          canvas.height / 2
        )
      );
    }

    const gravity = 0.3;
    const friction = 0.99;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.vy += gravity;
        particle.vx *= friction;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;

        drawParticle(ctx, particle);

        return particle.y < canvas.height + 50;
      });

      if (particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    const timeout = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearTimeout(timeout);
    };
  }, [isActive, createParticle, drawParticle, duration, onComplete]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ opacity: 0.9 }}
    />
  );
}
