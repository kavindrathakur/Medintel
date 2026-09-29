"use client";

import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  loading = false,
  icon,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={18} className="btn-spinner" />
      ) : icon ? (
        <span className="btn-icon">{icon}</span>
      ) : null}
      <span>{children}</span>

      <style jsx>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          min-height: 44px;
          padding: 0 var(--space-4);
          border-radius: var(--button-radius);
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 600;
          border: 1.5px solid transparent;
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }
        .btn:disabled {
          background: var(--neutral-300) !important;
          color: var(--neutral-500) !important;
          border-color: var(--neutral-300) !important;
          cursor: not-allowed;
          box-shadow: none !important;
        }
        .btn-primary {
          background: var(--primary-700);
          color: var(--white);
          border-color: var(--primary-700);
        }
        .btn-primary:hover:not(:disabled) {
          background: var(--primary-600);
          border-color: var(--primary-600);
          box-shadow: 0 2px 8px rgba(20, 108, 126, 0.25);
        }
        .btn-secondary {
          background: var(--white);
          color: var(--primary-700);
          border-color: var(--primary-700);
        }
        .btn-secondary:hover:not(:disabled) {
          background: var(--primary-50);
        }
        .btn-ghost {
          background: transparent;
          color: var(--primary-700);
        }
        .btn-ghost:hover:not(:disabled) {
          background: var(--primary-50);
        }
        .btn-danger {
          background: var(--danger);
          color: var(--white);
          border-color: var(--danger);
        }
        .btn-danger:hover:not(:disabled) {
          opacity: 0.9;
        }
        .btn-spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .btn-icon {
          display: flex;
          align-items: center;
        }
      `}</style>
    </button>
  );
}
