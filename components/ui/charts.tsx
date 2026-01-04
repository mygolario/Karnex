"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SimpleChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  color?: string;
  showLabels?: boolean;
  className?: string;
}

/**
 * Simple Bar Chart - Lightweight, no external dependencies
 */
export function SimpleBarChart({
  data,
  labels,
  height = 160,
  color = "bg-primary",
  showLabels = true,
  className,
}: SimpleChartProps) {
  const maxValue = Math.max(...data, 1);

  return (
    <div className={cn("w-full", className)}>
      <div
        className="flex items-end gap-2"
        style={{ height }}
      >
        {data.map((value, i) => {
          const percentage = (value / maxValue) * 100;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div
                className={cn(
                  "w-full rounded-t-lg transition-all duration-500",
                  color
                )}
                style={{ height: `${Math.max(percentage, 4)}%` }}
              />
              {showLabels && labels?.[i] && (
                <span className="text-xs text-muted-foreground truncate max-w-full">
                  {labels[i]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Simple Line Chart - SVG-based sparkline
 */
export function SimpleLineChart({
  data,
  height = 80,
  color = "#3B82F6",
  className,
}: Omit<SimpleChartProps, 'showLabels' | 'labels'> & { color?: string }) {
  const width = 300;
  const padding = 8;

  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue || 1;

  const points = data.map((value, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = padding + ((maxValue - value) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  // Create area path
  const areaPath = `M ${padding},${height - padding} L ${points} L ${width - padding},${height - padding} Z`;

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
      >
        {/* Gradient fill */}
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area */}
        <path
          d={areaPath}
          fill="url(#chartGradient)"
        />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* End dot */}
        <circle
          cx={width - padding}
          cy={padding + ((maxValue - data[data.length - 1]) / range) * (height - padding * 2)}
          r="4"
          fill={color}
        />
      </svg>
    </div>
  );
}

/**
 * Simple Progress Bar with animation
 */
interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  color = "bg-primary",
  size = "md",
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizeStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2 text-sm">
          {label && <span className="text-foreground font-medium">{label}</span>}
          {showValue && (
            <span className="text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", sizeStyles[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Donut/Ring Chart
 */
interface DonutChartProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
  className?: string;
}

export function DonutChart({
  value,
  max = 100,
  size = 120,
  strokeWidth = 12,
  color = "#3B82F6",
  bgColor = "#E5E7EB",
  children,
  className,
}: DonutChartProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Mini Sparkline for inline usage
 */
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function Sparkline({
  data,
  width = 60,
  height = 20,
  color = "#3B82F6",
  className,
}: SparklineProps) {
  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue || 1;

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = ((maxValue - value) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg
      width={width}
      height={height}
      className={cn("inline-block", className)}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
