"use client";

import { AlertTriangle, Info, CheckCircle, AlertCircle } from "lucide-react";
import { type ReactNode } from "react";

type AlertVariant = "info" | "warning" | "danger" | "success";

interface AlertProps {
  variant: AlertVariant;
  children: ReactNode;
  className?: string;
  id?: string;
}

const variantConfig: Record<AlertVariant, { icon: typeof Info; bg: string; border: string; text: string }> = {
  info: { icon: Info, bg: "var(--info-bg)", border: "var(--info)", text: "var(--info)" },
  warning: { icon: AlertTriangle, bg: "var(--warning-bg)", border: "var(--warning)", text: "var(--warning)" },
  danger: { icon: AlertCircle, bg: "var(--danger-bg)", border: "var(--danger)", text: "var(--danger)" },
  success: { icon: CheckCircle, bg: "var(--success-bg)", border: "var(--success)", text: "var(--success)" },
};

export default function Alert({ variant, children, className = "", id }: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      id={id}
      role="alert"
      className={`alert ${className}`}
      style={{
        background: config.bg,
        borderLeft: `3px solid ${config.border}`,
      }}
    >
      <Icon size={18} style={{ color: config.text, flexShrink: 0, marginTop: 2 }} />
      <div className="alert-content" style={{ color: config.text }}>
        {children}
      </div>

      <style jsx>{`
        .alert {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-4);
          border-radius: var(--button-radius);
          font-size: 14px;
          line-height: 20px;
        }
        .alert-content {
          flex: 1;
        }
      `}</style>
    </div>
  );
}
