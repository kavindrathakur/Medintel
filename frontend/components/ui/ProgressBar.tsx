"use client";

import { useEffect, useState } from "react";
import { getConfidenceLevel, type ConfidenceLevel } from "@/lib/types";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showValue?: boolean;
  animate?: boolean;
}

const levelColors: Record<ConfidenceLevel, string> = {
  higher: "var(--success)",
  moderate: "var(--warning)",
  lower: "var(--neutral-500)",
};

export default function ProgressBar({
  value,
  label,
  showValue = true,
  animate = true,
}: ProgressBarProps) {
  const [width, setWidth] = useState(animate ? 0 : value);
  const level = getConfidenceLevel(value);
  const color = levelColors[level];

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setWidth(value), 50);
      return () => clearTimeout(timer);
    }
  }, [value, animate]);

  return (
    <div className="progress-container">
      {label && <span className="progress-label">{label}</span>}
      <div className="progress-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label || "Confidence"}>
        <div
          className="progress-fill"
          style={{
            width: `${width}%`,
            backgroundColor: color,
            transition: animate ? "width 400ms ease" : "none",
          }}
        />
      </div>
      {showValue && <span className="progress-value" style={{ color }}>{value}%</span>}

      <style jsx>{`
        .progress-container {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          width: 100%;
        }
        .progress-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--neutral-700);
          white-space: nowrap;
        }
        .progress-track {
          flex: 1;
          height: 10px;
          background: var(--neutral-100);
          border-radius: var(--pill-radius);
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: var(--pill-radius);
          min-width: 2px;
        }
        .progress-value {
          font-size: 14px;
          font-weight: 600;
          min-width: 40px;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  );
}
