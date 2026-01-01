"use client";

import * as React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-lg bg-muted
        before:absolute before:inset-0
        before:bg-gradient-to-r before:from-transparent before:via-background/50 before:to-transparent
        before:animate-shimmer
        ${className}
      `}
      {...props}
    />
  );
}

// Preset skeleton variants
export function SkeletonText({ className = "", lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === lines - 1 ? "w-4/5" : "w-full"}`} 
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`p-6 rounded-2xl border border-border bg-card space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonAvatar({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };
  
  return <Skeleton className={`rounded-full ${sizeClasses[size]} ${className}`} />;
}

export function SkeletonButton({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-10 w-24 rounded-xl ${className}`} />;
}

// Dashboard skeleton for loading states
export function SkeletonDashboard() {
  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <SkeletonButton />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <Skeleton className="h-5 w-32" />
          <SkeletonText lines={4} />
        </div>
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <Skeleton className="h-5 w-32" />
          <SkeletonText lines={4} />
        </div>
      </div>
    </div>
  );
}
