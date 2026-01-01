"use client";

import * as React from "react";

type AnimationVariant = "fade-in" | "fade-in-up" | "fade-in-down" | "slide-in-right" | "slide-in-left" | "scale-in";

interface AnimatedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  className?: string;
  staggerChildren?: boolean;
  staggerDelay?: number;
}

export function AnimatedContainer({
  children,
  variant = "fade-in-up",
  delay = 0,
  duration = 500,
  className = "",
  staggerChildren = false,
  staggerDelay = 100,
  ...props
}: AnimatedContainerProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animationStyles: Record<AnimationVariant, { from: React.CSSProperties; to: React.CSSProperties }> = {
    "fade-in": {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    "fade-in-up": {
      from: { opacity: 0, transform: "translateY(20px)" },
      to: { opacity: 1, transform: "translateY(0)" },
    },
    "fade-in-down": {
      from: { opacity: 0, transform: "translateY(-20px)" },
      to: { opacity: 1, transform: "translateY(0)" },
    },
    "slide-in-right": {
      from: { opacity: 0, transform: "translateX(-20px)" },
      to: { opacity: 1, transform: "translateX(0)" },
    },
    "slide-in-left": {
      from: { opacity: 0, transform: "translateX(20px)" },
      to: { opacity: 1, transform: "translateX(0)" },
    },
    "scale-in": {
      from: { opacity: 0, transform: "scale(0.95)" },
      to: { opacity: 1, transform: "scale(1)" },
    },
  };

  const styles = animationStyles[variant];

  if (staggerChildren) {
    return (
      <div
        ref={ref}
        className={className}
        {...props}
      >
        {React.Children.map(children, (child, index) => (
          <div
            style={{
              ...(isVisible ? styles.to : styles.from),
              transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              transitionDelay: `${delay + index * staggerDelay}ms`,
            }}
          >
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...(isVisible ? styles.to : styles.from),
        transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Intersection observer based animation (animate on scroll into view)
export function AnimateOnScroll({
  children,
  variant = "fade-in-up",
  threshold = 0.1,
  className = "",
  once = true,
}: {
  children: React.ReactNode;
  variant?: AnimationVariant;
  threshold?: number;
  className?: string;
  once?: boolean;
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, once]);

  const animationClasses: Record<AnimationVariant, string> = {
    "fade-in": "animate-fade-in",
    "fade-in-up": "animate-fade-in-up", 
    "fade-in-down": "animate-fade-in-down",
    "slide-in-right": "animate-slide-in-right",
    "slide-in-left": "animate-slide-in-left",
    "scale-in": "animate-scale-in",
  };

  return (
    <div
      ref={ref}
      className={`
        ${isVisible ? animationClasses[variant] : "opacity-0"}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Page transition wrapper
export function PageTransition({ 
  children,
  className = "",
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatedContainer 
      variant="fade-in-up" 
      duration={400}
      className={`min-h-screen ${className}`}
    >
      {children}
    </AnimatedContainer>
  );
}
